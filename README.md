# BTC Ticker - GNOME Shell Extension

A lightweight GNOME Shell extension that displays the real-time Bitcoin (BTC/USDT) price directly in your top bar, fetched from Binance.

![BTC Ticker](https://img.shields.io/badge/GNOME-45%20|%2046%20|%2047%20|%2048%20|%2049%20|%2050-blue)
![License](https://img.shields.io/badge/license-GPLv3-green)

---

## Features

- **Real-Time Price**: Displays the latest BTC/USDT price from Binance.
- **Auto-Refresh**: Updates automatically every 60 seconds.
- **Lightweight & Efficient**: Native ESM, uses Libsoup 3.0 with non-blocking async network calls and clean cancellation.
- **GNOME 45 - 50+ Compatible**: Fully compatible with modern GNOME Shell versions.

---

## Manual Installation

### From Source

1. Clone the repository:
   ```bash
   git clone git@github.com:Darksword333/btc-ticker.git
   ```

2. Copy the extension to your local GNOME extensions directory:
   ```bash
   mkdir -p ~/.local/share/gnome-shell/extensions/btc-ticker@Darksword
   cp metadata.json extension.js ~/.local/share/gnome-shell/extensions/btc-ticker@Darksword/
   ```

3. Enable the extension:
   ```bash
   gnome-extensions enable btc-ticker@Darksword
   ```

4. **Restart GNOME Shell**:
   - On **Wayland**: Log out and log back in.
   - On **X11**: Press `Alt + F2`, type `r`, and press `Enter`.

---

## Building the Zip Package

To pack the extension for submission to [extensions.gnome.org](https://extensions.gnome.org/):

```bash
gnome-extensions pack --force --out-dir .
```

This generates `btc-ticker@Darksword.shell-extension.zip`.

---

## License

GPL-3.0
