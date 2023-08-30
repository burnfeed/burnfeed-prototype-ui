import { CID } from "multiformats";
import { formatUnits, parseEther, parseGwei } from "viem";

export function isAddress(str: string): boolean {
  return /^0x[a-fA-F0-9]{40}$/.test(str);
}

export function isCID(str: string): boolean {
  return /^[a-zA-Z0-9]*$/.test(str);
}

export function shortAddress(str: string): string {
  if (!isAddress(str)) return str;
  return str.substring(0, 4) + "..." + str.substring(38);
}

export function shortCID(str: string): string {
  if (!isCID(str)) return str;
  return str.substring(0, 4) + "..." + str.substring(str.length - 5);
}

export function parseCID(str: string): string | null {
  try {
    return CID.parse(str).toString();
  } catch (error) {
    return null;
  }
}

export function validCID(str: any): boolean {
  if (parseCID(str) !== null) return true;
  return false;
}

export const blobToImage = (blob: Blob): string => {
  if (!window || !blob) return "";
  const urlCreator = window.URL || window.webkitURL;
  if (!urlCreator) return "";
  const imageUrl = urlCreator.createObjectURL(blob);
  return imageUrl;
};

export function formatWei(bn: bigint | number): string {
  if (typeof bn === "number") bn = BigInt(bn);
  if (bn == BigInt(0)) {
    return "0";
  } else if (bn < parseGwei("1.0")) {
    return bn.toString() + "Wei";
  } else if (bn < parseEther("1.0")) {
    return formatUnits(bn, 9) + "GWei";
  } else {
    return formatUnits(bn, 18) + "ETH";
  }
}

export function formatDateTimeByTs(timestamp: number | string): string {
  if (typeof timestamp !== "string" && typeof timestamp !== "number") return "";
  const now = Date.now();
  const diff = now - Number(timestamp);

  const seconds = Math.floor(diff / 1000);
  if (seconds < 5) {
    return "Just now";
  }
  if (seconds < 60) {
    return `${seconds}s`;
  }

  const minutes = Math.floor(diff / 1000 / 60);
  if (minutes < 60) {
    return `${minutes}m`;
  }

  const hours = Math.floor(diff / 1000 / 60 / 60);
  if (hours < 24) {
    return `${hours}h`;
  }

  const days = Math.floor(diff / 1000 / 60 / 60 / 24);
  if (days === 1) {
    return "Yesterday";
  }
  if (days < 7) {
    return `${days}days`;
  }

  const date = new Date(timestamp);
  const year = date.getFullYear();
  const month = date.getMonth() + 1;
  const day = date.getDate();
  const hoursStr = String(date.getHours()).padStart(2, "0");
  const minutesStr = String(date.getMinutes()).padStart(2, "0");

  return `${year}-${month}-${day} ${hoursStr}:${minutesStr}`;
}
