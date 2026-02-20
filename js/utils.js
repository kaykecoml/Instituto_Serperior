export function powerToDamage(power) {
  if (!power || power <= 0) return "—";

  const table = [
    [10,"1d6"],[15,"1d6+2"],[20,"2d6"],[25,"2d6+2"],
    [30,"2d6+3"],[35,"2d6+5"],[40,"3d6+3"],[45,"3d6+5"],
    [50,"3d6+6"],[55,"3d6+8"],[60,"4d6+6"],[65,"4d6+8"],
    [70,"4d6+9"],[75,"4d6+11"],[80,"5d6+9"],[85,"5d6+11"],
    [90,"5d6+12"],[95,"5d6+14"],[100,"6d6+12"],[105,"6d6+14"],
    [110,"6d6+15"],[115,"6d6+17"],[120,"7d6+15"],[125,"7d6+17"],
    [130,"7d6+18"],[135,"7d6+20"],[140,"8d6+18"],[145,"8d6+20"],
    [150,"8d6+21"],[155,"8d6+23"],[160,"9d6+21"],[165,"9d6+23"],
    [170,"9d6+24"],[175,"9d6+26"],[180,"10d6+24"],[185,"10d6+26"],
    [190,"10d6+27"],[195,"10d6+29"],[200,"11d6+27"],
    [205,"11d6+29"],[210,"11d6+30"],[250,"13d6+36"]
  ];

  for (let i = table.length - 1; i >= 0; i--) {
    if (power >= table[i][0]) return table[i][1];
  }

  return "—";
}

export function accuracyToRPG(acc) {
  if (acc >= 100) return 3;
  if (acc >= 95) return 4;
  if (acc >= 90) return 5;
  if (acc >= 85) return 5;
  if (acc >= 80) return 6;
  if (acc >= 75) return 7;
  return 8;
}

export function ppToRPG(pp) {
  if (pp >= 35) return "À vontade";
  if (pp >= 20) return "Rodada sim Rodada não";
  if (pp >= 10) return "Por encontro";
  return "Diária";
}
