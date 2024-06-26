export async function sleep(seconds: number): Promise<void> {
  await new Promise((resolve) => {
    setTimeout(() => {
      resolve(0);
    }, seconds * 1000);
  });
}

export function format() {
  if (arguments.length == 0) return null;

  let str = arguments[0];
  for (let i = 1; i < arguments.length; i++) {
    let re = new RegExp('\\{' + (i - 1) + '\\}', 'gm');
    str = str.replace(re, arguments[i]);
  }
  return str;
}

// Convert normal string to u8 array
export function stringToByteArray(str: string) {
  return Array.from(str, function (byte) {
    return byte.charCodeAt(0);
  });
}

// Convert u8 array to hex string
export function toHexString(byteArray: Uint8Array) {
  return (
    '0x' +
    Array.from(byteArray, function (byte) {
      return ('0' + (byte & 0xff).toString(16)).slice(-2);
    }).join('')
  );
}

// Convert hex string to u8 array buffer
export function toByteArray(hexString: string) {
  if (hexString.substr(0, 2) == '0x') {
    hexString = hexString.substr(2);
  }

  let result = [];
  for (let i = 0; i < hexString.length; i += 2) {
    result.push(parseInt(hexString.substr(i, 2), 16));
  }
  return result;
}

export function toXOnly(pubKey: Buffer): Buffer {
  return pubKey.length === 32 ? pubKey : pubKey.slice(1, 33)
}

/**
 *
 * @param {string[]} u64Array There should be at least four items in the array, but only the first four items will be used
 * @return {bigint}
 */
export function toU256FromU64Array(u64Array: Array<string>): bigint {
  let sum =
      (BigInt(u64Array[0]) << 192n) +
      (BigInt(u64Array[1]) << 128n) +
      (BigInt(u64Array[2]) << 64n) +
      BigInt(u64Array[3])
  return sum
}