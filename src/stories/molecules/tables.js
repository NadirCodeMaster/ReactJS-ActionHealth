import React from "react";
import { Paper, Table, TableBody, TableCell, TableHead, TableRow } from "@mui/material";

export default {
  title: "Molecules/Tables",
  parameters: {
    controls: { hideNoControlsWarning: true },
  },
};

const tableOutput = () => {
  let tableRowId = 0;
  const createData = (name, calories, fat, carbs, protein) => {
    tableRowId += 1;
    return { tableRowId, name, calories, fat, carbs, protein };
  };

  const tableRows = [
    createData("Frozen yoghurt", 159, 6.0, 24, 4.0),
    createData("Ice cream sandwich", 237, 9.0, 37, 4.3),
    createData("Eclair", 262, 16.0, 24, 6.0),
    createData("Cupcake", 305, 3.7, 67, 4.3),
    createData("Gingerbread", 356, 16.0, 49, 3.9),
  ];

  return (
    <Table>
      <TableHead>
        <TableRow>
          <TableCell>Dessert (100g serving)</TableCell>
          <TableCell align="right">Calories</TableCell>
          <TableCell align="right">Fat (g)</TableCell>
          <TableCell align="right">Carbs (g)</TableCell>
          <TableCell align="right">Protein (g)</TableCell>
        </TableRow>
      </TableHead>
      <TableBody>
        {tableRows.map((row) => (
          <TableRow key={row.tableRowId}>
            <TableCell component="th" scope="row">
              {row.name}
            </TableCell>
            <TableCell align="right">{row.calories}</TableCell>
            <TableCell align="right">{row.fat}</TableCell>
            <TableCell align="right">{row.carbs}</TableCell>
            <TableCell align="right">{row.protein}</TableCell>
          </TableRow>
        ))}
      </TableBody>
    </Table>
  );
};

export const OnBackground = () => <React.Fragment>{tableOutput()}</React.Fragment>;

export const OnPaper = () => <Paper>{tableOutput()}</Paper>;
