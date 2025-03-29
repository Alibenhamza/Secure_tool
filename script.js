function encode6bit(num) {
  if (num < 0 || num > 63) return "?";
  return String.fromCharCode(num + 32 === 32 ? 96 : num + 32);
}

function decode6bit(char) {
  if (char === "`") return 0;
  const code = char.charCodeAt(0);
  if (code < 32 || code > 127) return -1;
  return (code - 32) & 0x3f;
}

function customEncode(input) {
  if (typeof input !== "string") return "";
  const bytes = new TextEncoder().encode(input);
  let encoded = "";

  for (let i = 0; i < bytes.length; i += 3) {
    const b1 = bytes[i] || 0;
    const b2 = bytes[i + 1] || 0;
    const b3 = bytes[i + 2] || 0;

    const combined = (b1 << 16) | (b2 << 8) | b3;

    encoded += encode6bit((combined >> 18) & 0x3f);
    encoded += encode6bit((combined >> 12) & 0x3f);
    encoded += encode6bit((combined >> 6) & 0x3f);
    encoded += encode6bit(combined & 0x3f);
  }
  return encoded;
}

function customDecode(encoded) {
  if (typeof encoded !== "string" || encoded.length % 4 !== 0) {
    throw new Error("Invalid encoded string");
  }

  const bytes = [];
  for (let i = 0; i < encoded.length; i += 4) {
    const group = encoded.substr(i, 4);
    const values = [];

    for (let j = 0; j < 4; j++) {
      const decoded = decode6bit(group[j]);
      if (decoded < 0) throw new Error("Invalid character");
      values.push(decoded);
    }

    const combined =
      (values[0] << 18) | (values[1] << 12) | (values[2] << 6) | values[3];

    bytes.push(
      (combined >> 16) & 0xff,
      (combined >> 8) & 0xff,
      combined & 0xff
    );
  }

  let end = bytes.length;
  while (end > 0 && bytes[end - 1] === 0) end--;
  return new TextDecoder().decode(new Uint8Array(bytes.slice(0, end)));
}

async function encodePassword(event) {
  const btn = event.currentTarget;
  const loader = btn.querySelector(".loader");
  const buttonText = btn.querySelector(".button-text");

  try {
    buttonText.style.visibility = "hidden";
    loader.style.display = "block";

    const password = document.getElementById("password").value;
    const encoded = customEncode(password);
    document.getElementById("result").textContent = encoded;
    document.getElementById("result").style.backgroundColor = "#f0fdf4";
  } catch (error) {
    document.getElementById("result").textContent = error.message;
    document.getElementById("result").style.backgroundColor = "#fef2f2";
  } finally {
    buttonText.style.visibility = "visible";
    loader.style.display = "none";
  }
}

async function decodePassword(event) {
  const btn = event.currentTarget;
  const loader = btn.querySelector(".loader");
  const buttonText = btn.querySelector(".button-text");

  try {
    buttonText.style.visibility = "hidden";
    loader.style.display = "block";

    const encoded = document.getElementById("password").value;
    const decoded = customDecode(encoded);
    document.getElementById("result").textContent = decoded;
    document.getElementById("result").style.backgroundColor = "#f0fdf4";
  } catch (error) {
    document.getElementById("result").textContent = error.message;
    document.getElementById("result").style.backgroundColor = "#fef2f2";
  } finally {
    buttonText.style.visibility = "visible";
    loader.style.display = "none";
  }
}
