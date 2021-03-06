const collections = require("./collections")
const selectors = require("./selectors")
const feedsCurrent = collections.feedsCurrent
const feedsVwapCurrent = collections.feedsVwapCurrent
// get weighted native price, given that there can exist both direct and
// reverted market pairs.
export default function weightedPriceNative (base, quote){
  if (base === quote) return 1;
  //1. get both direct and revert price
  // note: for non-weighted pairs - there d be find().fetch(), and also weighting/getting reverse price would involve extra mapreduce step
  const direct = feedsVwapCurrent.findOne(
    selectors.pairsByTwoIdsOrdered(base, quote));
  const reverted = feedsVwapCurrent.findOne(
    selectors.pairsByTwoIdsOrdered(quote, base));

  let revertedPrice, revertedVolume;

  //2. weight them. do not forget volume is given against quote, not base
  if (!direct && !reverted) return undefined;

  // nothing to weight
  if (!reverted) return direct.last.native;

  if (reverted) {
    revertedPrice = 1/reverted.last.native;

    // nothing to weight
    if (!direct) return revertedPrice;

    revertedVolume = reverted.volume.native/reverted.last.native;
    return (direct.last.native*direct.volume.native + revertedPrice*revertedVolume) / (revertedVolume + direct.volume.native)
  }
}
