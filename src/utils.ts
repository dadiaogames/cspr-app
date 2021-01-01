import _ from 'lodash';

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

export function rand(seed: string) {
  let val = _.sum(seed.split("").map((c, idx) => seed.charCodeAt(idx)));
  let x = Math.sin(val++) * 10000;
  return x - Math.floor(x);
}


export class PRNG {
  seed: string | number;
  val: number;

  constructor(seed: string | number, val?: number) {
    this.seed = seed || 0;

    if (val == undefined) {
      this.val = 0;
      if (typeof seed == "string"){
        for (let i=0; i<seed.length; i++) {
          this.val += seed.charCodeAt(i);
        }
      }
      else {
        this.val = seed;
      }

    // this.random = this.random.bind(this);
    // No need to bind
    }
  else {
    this.val = val;
  }
}

  random() {
    let x = Math.sin(this.val++) * 10000;
    let result = x - Math.floor(x);
    this.val += 2; //To ensure this is stable
    return result;
  }

  randRange(x: number) {
    return Math.floor(x * this.random());
  }

  choice(arr: any[]) {
    let len = arr.length;
    return arr[this.randRange(len)];
  }

  shuffle(deck: any[]) {
    let clone = deck.slice(0);
    let srcIndex = deck.length;
    let dstIndex = 0;
    let shuffled = new Array(srcIndex);

    while (srcIndex) {
      let randIndex = (srcIndex * this.random()) | 0;
      shuffled[dstIndex++] = clone[randIndex];
      clone[randIndex] = clone[--srcIndex];
    }

    return shuffled;
  }
}