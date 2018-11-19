import React, {Component} from 'react';
import './App.css';

class App extends Component {

    constructor(props) {
        super(props);
        this.state = {
            trades: [],
            book: [],
            booksell: [],
            ticker: []
        }
    }

    componentDidMount() {

        let channels = {};
        let symbol = 'tBTCUSD';

        let wss = new WebSocket("wss://api.bitfinex.com/ws/2");
        wss.onopen = () => {
            wss.send(JSON.stringify({
                "symbol": symbol,
                "event": "subscribe",
                "channel": "Trades"
            }));

            wss.send(JSON.stringify({
                "symbol": symbol,
                "event": "subscribe",
                "channel": "Ticker"
            }));

            //todo precision
            wss.send(JSON.stringify({
                "symbol": symbol,
                // "prec": "P1",
                "event": "subscribe",
                "channel": "Book"
            }));
        };

        wss.onmessage = (event) => {

            let data = JSON.parse(event.data);
            if (data.event === 'subscribed') {
                channels[data.chanId] = data.channel;
            } else {
                if (data.shift) {
                    let chanId = data.shift();
                    if (data !== "hb") {
                        let ch = channels[chanId];
                        if ((ch === 'book') && (data[0][2] < 0)) {
                            ch = 'booksell';
                        }
                        let chData = this.state[ch];
                        if (chData.length > 20) {
                            chData.shift();
                        }

                        if (ch === 'trades') {
                            data.forEach(el => {
                                chData.unshift(el);
                            });
                        } else {
                            chData.push(data);
                        }

                        if (ch === 'ticker' && data[0] &&  data[0].length === 10) {
                            chData = data[0];
                        }

                        this.setState({[ch]: chData});
                    }
                }

            }

        }
    }

    /***
     * https://docs.bitfinex.com/v2/reference#rest-public-books
     * // on trading pairs (ex. tBTCUSD)
     [
     [
     PRICE,
     COUNT,
     AMOUNT
     ]
     ]
     * @returns {Array}
     */

    book() {
        let table = [];
        this.state.book.forEach(el => {
            let PRICE = el[0][0];
            let COUNT = el[0][1];
            let AMOUNT = el[0][2];
            if (COUNT > 0) {
                table.push(<tr key={Math.random()}>
                    <td>{COUNT} </td>
                    <td>{AMOUNT} </td>
                    <td>{COUNT * AMOUNT} </td>
                    <td>{PRICE} </td>
                </tr>)
            }

        });
        return table
    }

    booksell() {
        let table = [];
        this.state.book.forEach(el => {
            let PRICE = el[0][0];
            let COUNT = el[0][1];
            let AMOUNT = el[0][2];
            if (COUNT > 0) {
                table.push(<tr key={Math.random()}>
                    <td>{PRICE} </td>
                    <td>{COUNT * AMOUNT} </td>
                    <td>{AMOUNT} </td>
                    <td>{COUNT} </td>
                </tr>)
            }

        });
        return table
    }


    /**https://docs.bitfinex.com/v2/reference#rest-public-trades
     * [
     ID,
     MTS,
     AMOUNT,
     PRICE
     ]
     * @returns {Array}
     */
    trades() {
        let table = [];
        this.state.trades.forEach(el => {
           // console.log(el);
            if(el.length === 4){
                let MTS = el[1];
                let date = new Date(MTS);
                let hr=date.getHours() > 9 ? date.getHours() : '0' + date.getHours();
                let min=date.getMinutes() > 9 ? date.getMinutes() : '0' + date.getMinutes();
                let sec=date.getSeconds() > 9 ? date.getSeconds() : '0' + date.getSeconds();
                let AMOUNT = el[2];
                let PRICE = el[3];

                table.push(<tr key={Math.random()}>
                    <td>{hr}:{min}:{sec} </td>
                    <td>{PRICE} </td>
                    <td>{AMOUNT} </td>
                </tr>)
            }
        });
        return table
    }

    /***
     * https://docs.bitfinex.com/v2/reference#rest-public-ticker
     * // on trading pairs (ex. tBTCUSD)
     [
     BID,
     BID_SIZE,
     ASK,
     ASK_SIZE,
     DAILY_CHANGE,
     DAILY_CHANGE_PERC,
     LAST_PRICE,
     VOLUME,
     HIGH,
     LOW
     ]
     */

    ticker() {
        let table = [];
        let data = this.state.ticker;
        if(data){
            let VOLUME = data[7];
            let DAILY_CHANGE_PERC = data[5];
            let LAST_PRICE = data[6];
            table.push(<tr key={Math.random()}>
                <td>{VOLUME} </td>
                <td>{DAILY_CHANGE_PERC} </td>
                <td>{LAST_PRICE} </td>
            </tr>)
        }
        return table
    }

    render() {
        return (
            <div className="App">
                <div>
                    <div className="title">TICKER</div>
                    <table className="ticker">
                        <tbody>
                        <tr>
                            <td>VOLUME</td>
                            <td>DAILY CHANGE PERC</td>
                            <td>LAST PRICE</td>
                        </tr>
                        {this.ticker()}
                        </tbody>
                    </table>
                </div>
                <div className="left">
                    <div className="title">ORDER BOOK BTC/USD</div>
                    <table className="tbl left">
                        <tbody>

                        <tr>
                            <td>COUNT</td>
                            <td>AMOUNT</td>
                            <td>TOTAL</td>
                            <td>PRICE</td>
                        </tr>
                        {this.book()}
                        </tbody>
                    </table>
                    <table className="tbl">
                        <tbody>
                        <tr>
                            <td>PRICE</td>
                            <td>TOTAL</td>
                            <td>AMOUNT</td>
                            <td>COUNT</td>
                        </tr>
                        {this.booksell()}
                        </tbody>
                    </table>
                </div>
                <div className="left">
                    <div className="title">TRADES BTC/USD</div>
                    <table className="tbl left">
                        <tbody>
                        <tr>
                            <td>TIME</td>
                            <td>PRICE</td>
                            <td>AMOUNT</td>
                        </tr>
                        {this.trades()}
                        </tbody>
                    </table>
                </div>
            </div>
        );
    }
}

export default App;
