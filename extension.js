import Clutter from 'gi://Clutter';
import Gio from 'gi://Gio';
import GLib from 'gi://GLib';
import GObject from 'gi://GObject';
import Soup from 'gi://Soup';
import St from 'gi://St';

import {Extension} from 'resource:///org/gnome/shell/extensions/extension.js';
import * as Main from 'resource:///org/gnome/shell/ui/main.js';
import * as PanelMenu from 'resource:///org/gnome/shell/ui/panelMenu.js';

const BINANCE_API_URL = 'https://api.binance.com/api/v3/ticker/price?symbol=BTCUSDT';
const UPDATE_INTERVAL_SECONDS = 60;
const REQUEST_TIMEOUT_SECONDS = 10;

const BtcTickerIndicator = GObject.registerClass(
class BtcTickerIndicator extends PanelMenu.Button {
    _init() {
        super._init(0.0, 'BTC Ticker', true);

        this._timeoutId = null;
        this._cancellable = null;
        this._httpSession = new Soup.Session({
            timeout: REQUEST_TIMEOUT_SECONDS,
        });

        this._label = new St.Label({
            text: '...',
            y_align: Clutter.ActorAlign.CENTER,
        });
        this.add_child(this._label);

        this.connect('destroy', () => this._cleanup());

        this._fetchPrice();

        this._timeoutId = GLib.timeout_add_seconds(
            GLib.PRIORITY_DEFAULT,
            UPDATE_INTERVAL_SECONDS,
            () => {
                this._fetchPrice();
                return GLib.SOURCE_CONTINUE;
            }
        );
    }

    _fetchPrice() {
        if (!this._httpSession)
            return;

        if (this._cancellable) {
            this._cancellable.cancel();
            this._cancellable = null;
        }
        this._cancellable = new Gio.Cancellable();

        const message = Soup.Message.new('GET', BINANCE_API_URL);

        this._httpSession.send_and_read_async(
            message,
            GLib.PRIORITY_DEFAULT,
            this._cancellable,
            (session, result) => {
                if (!this._httpSession || this._cancellable?.is_cancelled())
                    return;

                try {
                    const bytes = session.send_and_read_finish(result);
                    const statusCode = message.get_status();

                    if (statusCode !== Soup.Status.OK) {
                        throw new Error(
                            `HTTP ${statusCode}: ${message.get_reason_phrase()}`
                        );
                    }

                    const decoder = new TextDecoder('utf-8');
                    const text = decoder.decode(bytes.get_data());
                    const data = JSON.parse(text);

                    const price = parseFloat(data.price);
                    if (Number.isNaN(price))
                        throw new Error('Invalid price received from API');

                    const formattedPrice = `${new Intl.NumberFormat('en-US', {
                        maximumFractionDigits: 0,
                    }).format(price)}$`;

                    this._label.set_text(formattedPrice);
                    console.log(`[btc-ticker] Bitcoin price updated: ${formattedPrice}`);
                } catch (error) {
                    if (
                        error instanceof GLib.Error &&
                        error.matches(Gio.IOErrorEnum, Gio.IOErrorEnum.CANCELLED)
                    ) {
                        return;
                    }

                    if (!this._httpSession || this._cancellable?.is_cancelled())
                        return;

                    console.error(`[btc-ticker] Failed to fetch Bitcoin price: ${error.message}`);
                    this._label.set_text('Err');
                }
            }
        );
    }

    _cleanup() {
        if (this._timeoutId) {
            GLib.Source.remove(this._timeoutId);
            this._timeoutId = null;
        }

        if (this._cancellable) {
            this._cancellable.cancel();
            this._cancellable = null;
        }

        if (this._httpSession) {
            this._httpSession.abort();
            this._httpSession = null;
        }
    }

    destroy() {
        this._cleanup();
        super.destroy();
    }
});

export default class BtcTickerExtension extends Extension {
    enable() {
        this._indicator = new BtcTickerIndicator();
        Main.panel.addToStatusArea(this.uuid, this._indicator);
    }

    disable() {
        if (this._indicator) {
            this._indicator.destroy();
            this._indicator = null;
        }
    }
}
