module.exports = function (api) {
  api.cache(true);
  return {
    presets: ['babel-preset-expo'],
    // Нет ручного плагина — Expo сам справится для Reanimated 3.x
  };
};