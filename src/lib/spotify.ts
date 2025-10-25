interface Token {
  clientId: string;
  accessToken: string;
  accessTokenExpirationTimestampMs: number;
  isAnonymous: boolean;
  totpValidity: boolean;
  _notes: string;
}

class Spotify {
  private readonly SECRET_CIPHER_URL =
    "https://github.com/xyloflake/spot-secrets-go/blob/main/secrets/secretDict.json?raw=true";
  private readonly tokenUrl = "https://open.spotify.com/api/token";
  private readonly lyricsUrl =
    "https://spclient.wg.spotify.com/color-lyrics/v2/track/";
  private readonly serverTimeUrl = "https://open.spotify.com/api/server-time";
  private spDc: string;
  private cachedToken: Token | null;
  private secret: Uint8Array<ArrayBufferLike> | null;
  private version: string | null;

  constructor(spDc: string) {
    this.spDc = spDc;
    this.cachedToken = null;
    this.secret = null;
    this.version = null;
  }

  private async getSecretVersion(): Promise<void> {
    const res = await fetch(this.SECRET_CIPHER_URL);
    if (!res.ok) {
      throw new Error("Failed to fetch TOTP secret and version.");
    }

    const data: Record<string, number[]> = await res.json();

    const versions = Object.keys(data);
    const secretVersion = versions[versions.length - 1];
    const asciiCodes = Object.values(data)[versions.length - 1];

    const transformed = asciiCodes.map(
      (val: number, i: number) => val ^ ((i % 33) + 9),
    );

    const secretBytes = new TextEncoder().encode(transformed.join(""));

    this.secret = secretBytes;
    this.version = secretVersion;
  }

  private async hmacSha1(
    keyBytes: Uint8Array,
    message: Uint8Array,
  ): Promise<ArrayBuffer> {
    const key = await crypto.subtle.importKey(
      "raw",
      keyBytes,
      { name: "HMAC", hash: "SHA-1" },
      false,
      ["sign"],
    );

    return crypto.subtle.sign("HMAC", key, message);
  }

  private async generateTotp(serverTimeSeconds: number): Promise<string> {
    const period = 30;
    const digits = 6;

    const counter = Math.floor(serverTimeSeconds / period);
    const counterBuffer = new ArrayBuffer(8);
    const view = new DataView(counterBuffer);
    view.setBigUint64(0, BigInt(counter), false);

    const hmacResult = new Uint8Array(
      await this.hmacSha1(this.secret!, new Uint8Array(counterBuffer)),
    );

    const offset = hmacResult[hmacResult.length - 1] & 0x0f;

    const binary =
      (((hmacResult[offset] & 0x7f) << 24) |
        ((hmacResult[offset + 1] & 0xff) << 16) |
        ((hmacResult[offset + 2] & 0xff) << 8) |
        (hmacResult[offset + 3] & 0xff)) >>>
      0;

    const otp = String(binary % 10 ** digits).padStart(digits, "0");
    return otp;
  }

  private async getServerTimeParams(): Promise<Record<string, string>> {
    try {
      if (!this.secret || !this.version) await this.getSecretVersion();

      const response = await fetch(this.serverTimeUrl);
      if (!response.ok) throw new Error("Failed to fetch server time");

      const data = await response.json();
      if (!data.serverTime) throw new Error("Invalid server time response");

      const totp = await this.generateTotp(data.serverTime);
      const timestamp = Math.floor(new Date().getTime() / 1000);

      return {
        reason: "transport",
        productType: "web-player",
        totp,
        totpVer: this.version!,
        ts: timestamp.toString(),
      };
    } catch (error: unknown) {
      const errorMessage =
        error instanceof Error ? error.message : String(error);
      throw new Error(`Error fetching server time: ${errorMessage}`);
    }
  }

  private async getToken(): Promise<void> {
    try {
      const params = await this.getServerTimeParams();
      const headers = {
        "User-Agent":
          "Mozilla/5.0 (X11; Linux x86_64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/101.0.0.0 Safari/537.36",
        Cookie: `sp_dc=${this.spDc}`,
      };

      const response = await fetch(
        `${this.tokenUrl}?${new URLSearchParams(params).toString()}`,
        { headers },
      );

      if (!response.ok)
        throw new Error(`Token request failed (status ${response.status})`);

      const result: Token = await response.json();
      if (result.isAnonymous) throw new Error("Invalid sp_dc value");

      this.cachedToken = result;
    } catch (error: unknown) {
      const errorMessage =
        error instanceof Error ? error.message : String(error);
      throw new Error(`Error fetching token: ${errorMessage}`);
    }
  }

  private async checkTokenExpire(): Promise<void> {
    if (
      this.cachedToken &&
      this.cachedToken.accessTokenExpirationTimestampMs > Date.now()
    ) {
      return;
    }

    await this.getToken();
  }

  public async getLyrics(trackId: string): Promise<string> {
    await this.checkTokenExpire();
    const token = this.cachedToken?.accessToken;

    const headers = {
      "User-Agent":
        "Mozilla/5.0 (X11; Ubuntu; Linux x86_64; rv:144.0) Gecko/20100101 Firefox/144.0",
      "App-platform": "WebPlayer",
      authorization: `Bearer ${token}`,
    };

    const response = await fetch(
      `${this.lyricsUrl}${trackId}?format=json&market=from_token`,
      { headers },
    );

    if (!response.ok) throw new Error("Failed to fetch lyrics");

    return await response.json();
  }
}

export default Spotify;
