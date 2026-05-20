const cache = new Map();

function get(key) {
  const entry = cache.get(key);
  if (!entry) return null;

  if (Date.now() > entry.expiresAt) {
    cache.delete(key);
    return null;
  }

  return entry.value;
}

function set(key, value, ttlMs) {
  if (value === null || value === undefined) return;
  cache.set(key, {
    value,
    expiresAt: Date.now() + ttlMs,
  });
}

function del(key) {
  cache.delete(key);
}

function clear() {
  cache.clear();
}

module.exports = {
  get,
  set,
  del,
  clear,
};
