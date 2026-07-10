module.exports = function (api) {
  api.cache(true);
  return {
    presets: ['babel-preset-expo'],
    plugins: [
      // plugin yang loose: true dihilangkan karena menyebabkan bug NONE di React Native 0.76
    ],
  };
};
