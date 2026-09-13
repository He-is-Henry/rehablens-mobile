const baseConfig = require("./app.json");

module.exports = () => {
  const isDev = process.env.APP_VARIANT === "development";

  if (isDev) console.log("Currently in dev mode, will installl a dev version.");

  return {
    ...baseConfig.expo,
    name: isDev ? "RehabLens (Dev)" : "RehabLens",
    android: {
      ...baseConfig.expo.android,
      package: isDev
        ? "com.olanrewajubasit.rehablens.dev"
        : "com.olanrewajubasit.rehablens",
    },
  };
};
