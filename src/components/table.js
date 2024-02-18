import React, { useEffect, useState } from "react";
import PropTypes from "prop-types";
import { useTheme } from "@mui/material/styles";
import {
  Box,
  Grid,
  Table,
  Paper,
  Button,
  Select,
  MenuItem,
  TableRow,
  TextField,
  TableBody,
  TableHead,
  TableCell,
  IconButton,
  TableFooter,
  TableContainer,
  TablePagination,
  FormControl,
  InputLabel,
} from "@mui/material";
import LastPageIcon from "@mui/icons-material/LastPage";
import FirstPageIcon from "@mui/icons-material/FirstPage";
import KeyboardArrowLeft from "@mui/icons-material/KeyboardArrowLeft";
import KeyboardArrowRight from "@mui/icons-material/KeyboardArrowRight";

function TablePaginationActions(props) {
  const theme = useTheme();
  const { count, page, rowsPerPage, onPageChange } = props;

  const handleFirstPageButtonClick = (event) => {
    onPageChange(event, 0);
  };

  const handleBackButtonClick = (event) => {
    onPageChange(event, page - 1);
  };

  const handleNextButtonClick = (event) => {
    onPageChange(event, page + 1);
  };

  const handleLastPageButtonClick = (event) => {
    onPageChange(event, Math.max(0, Math.ceil(count / rowsPerPage) - 1));
  };

  return (
    <Box sx={{ flexShrink: 0, ml: 2.5 }}>
      <IconButton
        onClick={handleFirstPageButtonClick}
        disabled={page === 0}
        aria-label="first page"
      >
        {theme.direction === "rtl" ? <LastPageIcon /> : <FirstPageIcon />}
      </IconButton>
      <IconButton
        onClick={handleBackButtonClick}
        disabled={page === 0}
        aria-label="previous page"
      >
        {theme.direction === "rtl" ? (
          <KeyboardArrowRight />
        ) : (
          <KeyboardArrowLeft />
        )}
      </IconButton>
      <IconButton
        onClick={handleNextButtonClick}
        disabled={page >= Math.ceil(count / rowsPerPage) - 1}
        aria-label="next page"
      >
        {theme.direction === "rtl" ? (
          <KeyboardArrowLeft />
        ) : (
          <KeyboardArrowRight />
        )}
      </IconButton>
      <IconButton
        onClick={handleLastPageButtonClick}
        disabled={page >= Math.ceil(count / rowsPerPage) - 1}
        aria-label="last page"
      >
        {theme.direction === "rtl" ? <FirstPageIcon /> : <LastPageIcon />}
      </IconButton>
    </Box>
  );
}

TablePaginationActions.propTypes = {
  count: PropTypes.number.isRequired,
  onPageChange: PropTypes.func.isRequired,
  page: PropTypes.number.isRequired,
  rowsPerPage: PropTypes.number.isRequired,
};

const WebSocketComponent = () => {
  const [page, setPage] = useState(0);
  const [socket, setSocket] = useState(null);
  const [messages, setMessages] = useState([]);
  const [canReset, setCanReset] = useState(false);
  const [prevPrices, setPrevPrices] = useState({});
  const [rowsPerPage, setRowsPerPage] = useState(10);
  const [inputMessage, setInputMessage] = useState("");
  const [currencies, setCurrencies] = useState(["All"]);
  const [selectedCurrency, setSelectedCurrency] = useState("All");
  const [timesMessageReceived, setTimesMessageReceived] = useState(0);

  const emptyRows =
    page > 0 ? Math.max(0, (1 + page) * rowsPerPage - messages.length) : 0;

  const createSocket = () => {
    const newSocket = new WebSocket("wss://wssx.gntapi.com:443");

    newSocket.onopen = () => {
      console.log("WebSocket connected");
    };

    newSocket.onmessage = (event) => {
      let newMessage = event.data;
      if (typeof newMessage === "string") {
        newMessage = JSON.parse(newMessage);
      }

      Object.entries(newMessage.prices).map(([currencyPair, { bid, ask }]) => {
        setCurrencies((prevCurrencies) => {
          if (!prevCurrencies.includes(currencyPair)) {
            return [...prevCurrencies, currencyPair];
          } else {
            return prevCurrencies;
          }
        });

        setPrevPrices((prevPrices) => ({
          [currencyPair]: { bid, ask },
          ...prevPrices,
        }));

        setMessages((prevMessages) => [
          { [currencyPair]: { bid, ask } },
          ...prevMessages,
        ]);
      });
    };

    newSocket.onclose = () => {
      console.log("WebSocket closed");
    };

    setSocket(newSocket);

    return () => {
      newSocket.close();
    };
  };

  useEffect(() => {
    createSocket();
  }, []);

  const handleChangePage = (event, newPage) => {
    setPage(newPage);
  };

  const handleChangeRowsPerPage = (event) => {
    setRowsPerPage(parseInt(event.target.value, 10));
    setPage(0);
  };

  const sendMessage = async () => {
    if (inputMessage.trim() !== "") {
      console.log("sendMessage", inputMessage);
      socket.send(inputMessage);
      setTimesMessageReceived((prev) => prev + 1);
      setInputMessage("");
    }
  };

  const handleStopWebSocket = async () => {
    socket.close();
    await setSocket(null);
    await createSocket();
    await setTimesMessageReceived(0);
    await setCanReset(true);
  };

  const handleReset = () => {
    setCanReset(false);
    setMessages([]);
    setPrevPrices({});
    setCurrencies(["All"]);
    setSelectedCurrency("All");
  };

  const filteredMessages =
    rowsPerPage > 0
      ? selectedCurrency !== "All"
        ? messages
            .filter((message) => Object.keys(message)[0] === selectedCurrency)
            .slice(page * rowsPerPage, page * rowsPerPage + rowsPerPage)
        : messages.slice(page * rowsPerPage, page * rowsPerPage + rowsPerPage)
      : messages;

  return (
    <div>
      <h2>WebSocket Messages:</h2>
      <Grid container spacing={3}>
        <Grid item xs={12}>
          <TextField
            type="text"
            value={inputMessage}
            onChange={(e) => setInputMessage(e.target.value)}
            placeholder="Type your message..."
            variant="outlined"
            size="small"
            label="Message to send to WebSocket Server"
            disabled={timesMessageReceived > 0}
            fullWidth
          />
        </Grid>
        <Grid item xs={6}>
          <Button
            variant="contained"
            onClick={sendMessage}
            size="medium"
            fullWidth
            disabled={inputMessage.trim() === ""}
          >
            Send
          </Button>
        </Grid>
        <Grid item xs={6}>
          <Button
            variant="contained"
            onClick={handleStopWebSocket}
            size="medium"
            fullWidth
            disabled={messages.length === 0}
          >
            Stop WebSocket
          </Button>
        </Grid>
      </Grid>
      <div>
        {messages.length > 0 && (
          <>
            <h2>Forex Prices</h2>
            <Grid container spacing={3}>
              <Grid item xs={10} sx={{ mb: 3 }}>
                <FormControl fullWidth>
                  <InputLabel id="demo-simple-select-label">
                    Filter by Currency Exchange
                  </InputLabel>
                  <Select
                    value={selectedCurrency}
                    defaultValue="All"
                    onChange={(e) => setSelectedCurrency(e.target.value)}
                    label="Filter by Currency Exchange"
                    size="small"
                  >
                    {currencies.map((currency) => (
                      <MenuItem key={currency} value={currency}>
                        {currency}
                      </MenuItem>
                    ))}
                  </Select>
                </FormControl>
              </Grid>
              <Grid item xs={2} sx={{ mb: 3 }}>
                <Button
                  variant="contained"
                  onClick={handleReset}
                  size="medium"
                  fullWidth
                  disabled={!canReset}
                >
                  Reset
                </Button>
              </Grid>
            </Grid>

            <TableContainer component={Paper}>
              <Table aria-label="custom pagination table">
                <TableHead>
                  <TableRow>
                    <TableCell style={{ fontWeight: "bold" }}>
                      Currency Pair
                    </TableCell>
                    <TableCell align="right" style={{ fontWeight: "bold" }}>
                      Bid Price
                    </TableCell>
                    <TableCell align="right" style={{ fontWeight: "bold" }}>
                      Ask Price
                    </TableCell>
                  </TableRow>
                </TableHead>
                <TableBody>
                  {filteredMessages.map((message, index) => {
                    return Object.entries(message).map(
                      ([currencyPair, { bid, ask }]) => {
                        const prevBid = prevPrices[currencyPair]?.bid;
                        const prevAsk = prevPrices[currencyPair]?.ask;
                        const bidColor = bid > prevBid ? "green" : "red";
                        const askColor = ask > prevAsk ? "green" : "red";
                        return (
                          <TableRow key={currencyPair}>
                            <TableCell component="th" scope="row">
                              {currencyPair}
                            </TableCell>
                            <TableCell
                              style={{ width: 160, color: bidColor }}
                              align="right"
                            >
                              {bid}
                            </TableCell>
                            <TableCell
                              style={{ width: 160, color: askColor }}
                              align="right"
                            >
                              {ask}
                            </TableCell>
                          </TableRow>
                        );
                      }
                    );
                  })}

                  {emptyRows > 0 && (
                    <TableRow style={{ height: 53 * emptyRows }}>
                      <TableCell colSpan={6} />
                    </TableRow>
                  )}
                </TableBody>
                <TableFooter>
                  <TableRow>
                    <TablePagination
                      rowsPerPageOptions={[10, 50, 100]}
                      colSpan={3}
                      count={messages.length}
                      rowsPerPage={rowsPerPage}
                      page={page}
                      SelectProps={{
                        inputProps: {
                          "aria-label": "rows per page",
                        },
                        native: true,
                      }}
                      onPageChange={handleChangePage}
                      onRowsPerPageChange={handleChangeRowsPerPage}
                      ActionsComponent={TablePaginationActions}
                    />
                  </TableRow>
                </TableFooter>
              </Table>
            </TableContainer>
          </>
        )}
      </div>
    </div>
  );
};

export default WebSocketComponent;
