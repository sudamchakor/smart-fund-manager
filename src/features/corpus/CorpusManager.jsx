import React from "react";
import { useSelector, useDispatch } from "react-redux";
import {
  removeAsset,
  selectAllAssets,
  selectTotalCorpus,
  selectWeightedAverageReturn,
} from "./corpusSlice";
import {
  Box,
  Button,
  Card,
  CardContent,
  IconButton,
  Paper,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  Typography,
  useTheme,
  useMediaQuery,
  Divider,
  CardHeader, // Import CardHeader
} from "@mui/material";
import AddIcon from "@mui/icons-material/Add";
import DeleteIcon from "@mui/icons-material/Delete";
import { formatCurrency } from "../../utils/formatting";
import EditIcon from "@mui/icons-material/Edit";

const CorpusManager = ({ onOpenModal }) => {
  const dispatch = useDispatch();
  const assets = useSelector(selectAllAssets);
  const totalCorpus = useSelector(selectTotalCorpus);
  const weightedAverageReturn = useSelector(selectWeightedAverageReturn);
  const theme = useTheme();
  const isSmallScreen = useMediaQuery(theme.breakpoints.down("md"));

  const handleRemoveAsset = (id) => {
    dispatch(removeAsset(id));
  };
  console.log(assets, "Sudam");
  return (
    <Card sx={{ height: "100%", display: "flex", flexDirection: "column" }}>
      <CardHeader
        title={
          <Typography variant="h6" sx={{ fontWeight: "bold" }}>
            Investment Corpus
          </Typography>
        }
        action={
          !isSmallScreen && (
            <Button
              variant="contained"
              startIcon={<AddIcon />}
              onClick={() => onOpenModal("corpus", null, "add")}
            >
              Add
            </Button>
          )
        }
      />
      <Divider />
      <CardContent
        sx={{
          flexGrow: 1,
          display: "flex",
          flexDirection: "column",
          justifyContent: "space-between",
        }}
      >
        <TableContainer component={Paper}>
          <Table>
            <TableHead>
              <TableRow>
                <TableCell>Asset Name</TableCell>
                <TableCell align="right">Amount</TableCell>
                <TableCell align="right">Return</TableCell>
                <TableCell align="right">Actions</TableCell>
              </TableRow>
            </TableHead>
            <TableBody>
              {assets.map((asset) => {
                const expectedReturnNum = parseFloat(asset.expectedReturn);
                return (
                  <TableRow key={asset.id}>
                    <TableCell>{asset.label}</TableCell>
                    <TableCell align="right">
                      {formatCurrency(asset.value)}
                    </TableCell>
                    <TableCell align="right">
                      {!isNaN(expectedReturnNum) ? expectedReturnNum.toFixed(2) : '0.00'}%
                    </TableCell>
                    <TableCell align="right">
                      <IconButton
                        edge="end"
                        aria-label="edit"
                        color="primary"
                        onClick={() => onOpenModal("corpus", asset, "edit")}
                      >
                        <EditIcon fontSize="small" />
                      </IconButton>
                      <IconButton
                        edge="end"
                        aria-label="delete"
                        onClick={() => handleRemoveAsset(asset.id)}
                        color="error"
                      >
                        <DeleteIcon fontSize="small" />
                      </IconButton>
                    </TableCell>
                  </TableRow>
                );
              })}
            </TableBody>
          </Table>
        </TableContainer>

        <Paper
          sx={{
            mt: 2,
            p: 2,
            display: "flex",
            justifyContent: "space-between",
            alignItems: "center",
            backgroundColor: "primary.main",
            color: "primary.contrastText",
            flexWrap: "wrap", // Allow wrapping on small screens
            gap: 1,
          }}
        >
          <Typography variant="subtitle1">Total Corpus:</Typography>
          <Typography variant="h6" component="span" sx={{ fontWeight: "bold" }}>
            {formatCurrency(totalCorpus)}
          </Typography>
          <Typography variant="subtitle1">Avg. Return:</Typography>
          <Typography variant="h6" component="span" sx={{ fontWeight: "bold" }}>
            {weightedAverageReturn.toFixed(2)}%
          </Typography>
        </Paper>
      </CardContent>
    </Card>
  );
};

export default CorpusManager;
