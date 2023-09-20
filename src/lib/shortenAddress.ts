export function shortenAddress(address: string): string {
  if (!isValidEthereumAddress(address)) {
    throw new Error("Invalid Ethereum address");
  }

  if (address.startsWith("0x")) {
    address = address.slice(2);
  }

  const shortenedAddress = `0x${address.slice(0, 4)}...${address.slice(-4)}`;

  return shortenedAddress;
}

function isValidEthereumAddress(address: string): boolean {
  if (typeof address !== "string" || address.length !== 42) {
    return false;
  }

  return address.startsWith("0x") && /^[0-9A-Fa-f]{40}$/.test(address.slice(2));
}
