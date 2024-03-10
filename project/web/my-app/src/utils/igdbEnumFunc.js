import category from "../data/igdb/category.json";
import releaseDateRegion from "../data/igdb/releaseDateRegion.json";

export function convertCategory(categoryEnum) {
    return category[categoryEnum];
}

export function convertReleaseDateRegion(releaseDateRegionEnum) {
    return releaseDateRegion[releaseDateRegionEnum];
}

