// Four approved worlds, four real times of day. The four mother scenes remain intact.
export const approvedVariants = Object.freeze({summer:'b', autumn:'a'});
export const canonicalPeriods = Object.freeze({spring:'morning',summer:'day',autumn:'sunset',winter:'night'});
export const worldScenes = Object.freeze({
  spring:{morning:'locked-spring.webp',day:'world-spring-day.webp',sunset:'world-spring-sunset.webp',night:'world-spring-night.webp'},
  summer:{morning:'world-summer-morning.webp',day:'locked-summer-b.webp',sunset:'world-summer-sunset.webp',night:'world-summer-night.webp'},
  autumn:{morning:'world-autumn-morning.webp',day:'world-autumn-day.webp',sunset:'locked-autumn-a.webp',night:'world-autumn-night.webp'},
  winter:{morning:'world-winter-morning.webp',day:'world-winter-day.webp',sunset:'world-winter-sunset.webp',night:'locked-winter.webp'}
});
export const sceneAsset = (season,period) => `./assets/${worldScenes[season]?.[period]||worldScenes.spring.morning}`;
