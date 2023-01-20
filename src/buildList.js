const { version } = require("../package.json");
const mainnet = require("./tokens/mainnet.json");
const bridgeUtils = require('@uniswap/token-list-bridge-utils');
const defaultList = require('@uniswap/default-token-list/build/uniswap-default.tokenlist.json');

module.exports = async function buildList() {
  const parsed = version.split(".");

  // build l1 extended list (without L2 data and default list entries)
  const l1ExtendedList = {
    name: "Uniswap Labs Extended",
    timestamp: new Date().toISOString(),
    version: {
      major: +parsed[0],
      minor: +parsed[1],
      patch: +parsed[2],
    },
    tags: {},
    logoURI: "ipfs://QmNa8mQkrNKp1WEEeGjFezDmDeodkWRevGFN8JCV7b4Xir",
    keywords: ["uniswap", "extended"],
    tokens: [...mainnet]
      // sort them by symbol for easy readability
      .sort((t1, t2) => {
        if (t1.chainId === t2.chainId) {
          return t1.symbol.toLowerCase() < t2.symbol.toLowerCase() ? -1 : 1;
        }
        return t1.chainId < t2.chainId ? -1 : 1;
      }),
  };

  // add L2 data
  const multichainExtendedList = await bridgeUtils.chainify(l1ExtendedList);

  // add default list entries (resolves conflicts to default list)
  const mergedExtendedList = bridgeUtils.mergeTokenLists(
    defaultList,
    multichainExtendedList);

  // maintain original non-tokens properties of extended list (name, version, timestamp, etc) since mergeTokenLists overwrites them
  const finalExtendedList = {
    ...l1ExtendedList,
    tokens: mergedExtendedList.tokens
  };

    return finalExtendedList;
};