"""Small in-memory TTL cache for catalog responses from external providers."""
import asyncio
import time
from collections.abc import Awaitable, Callable
from typing import Any


class TTLCache:
    """Process-local cache with expiry and de-duplication of concurrent lookups.

    Catalog data (trending lists, genres, streaming services) is the same for every
    visitor and changes slowly, so one upstream call can serve many requests.
    """

    def __init__(self, max_entries: int = 512):
        self._max_entries = max_entries
        self._entries: dict[str, tuple[float, Any]] = {}
        self._pending: dict[str, asyncio.Task[Any]] = {}

    def _get(self, key: str) -> tuple[bool, Any]:
        entry = self._entries.get(key)
        if entry is None:
            return False, None
        expires_at, value = entry
        if expires_at <= time.monotonic():
            self._entries.pop(key, None)
            return False, None
        return True, value

    def _set(self, key: str, value: Any, ttl: float) -> None:
        if len(self._entries) >= self._max_entries:
            now = time.monotonic()
            for stale_key in [k for k, (expires_at, _) in self._entries.items() if expires_at <= now]:
                self._entries.pop(stale_key, None)
            while len(self._entries) >= self._max_entries:
                # Dicts keep insertion order, so this drops the oldest entry.
                self._entries.pop(next(iter(self._entries)))
        self._entries[key] = (time.monotonic() + ttl, value)

    async def get_or_set(
        self, key: str, ttl: float, factory: Callable[[], Awaitable[Any]]
    ) -> Any:
        """Return the cached value, or run ``factory`` once and cache its result.

        Failures are not cached, so the next request tries the provider again.
        """
        if ttl <= 0:
            return await factory()

        found, value = self._get(key)
        if found:
            return value

        pending = self._pending.get(key)
        if pending is None:
            pending = asyncio.ensure_future(factory())
            self._pending[key] = pending

            def _finish(task: asyncio.Task[Any]) -> None:
                self._pending.pop(key, None)
                if not task.cancelled() and task.exception() is None:
                    self._set(key, task.result(), ttl)

            pending.add_done_callback(_finish)

        # Shield so one disconnected client doesn't cancel the lookup for the others.
        return await asyncio.shield(pending)

    def clear(self) -> None:
        self._entries.clear()
