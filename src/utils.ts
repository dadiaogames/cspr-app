export function map_object<a,b>(fn: (arg: a, key?: string) => b, obj: Record<string,a>) {
  let new_obj: Record<string,b> = {};

  for (let k in obj) {
    new_obj[k] = fn(obj[k], k);
  }

  return new_obj;
}

export function reorder<a>(list: a[], indexes: number[]): a[] {
  return indexes.map(idx => list[idx]);
}

export function contain_key<a,b>(value: a, key: b) {
  if (typeof value == "object" && key in value) {
    return true;
  }
  else {
    return false;
  }
}