import React from "react";
import { Avatar, Chip } from "@mui/material";
import FaceIcon from "@mui/icons-material/Face";
import DoneIcon from "@mui/icons-material/Done";
import avatarImg from "../_support/lincoln-128x128.png";

export default {
  title: "Atoms/Chips",
  parameters: {
    controls: { hideNoControlsWarning: true },
  },
};

export const Chips = () => (
  <div>
    {chipsForColor()}
    <br />
    {chipsForColor("primary")}
    <br />
    {chipsForColor("secondary")}
  </div>
);

// -------------------
// Supporting elements
// -------------------

const handleDelete = () => {
  alert("You clicked a delete icon."); // eslint-disable-line no-alert
};

const handleClick = () => {
  alert("You clicked a Chip."); // eslint-disable-line no-alert
};

const chipsForColor = (color) => {
  return (
    <div>
      <Chip label="Basic Chip" color={color} />
      <Chip
        avatar={<Avatar alt="Lincoln" src={avatarImg} />}
        label="Clickable Chip"
        onClick={handleClick}
        color={color}
      />
      <Chip
        avatar={<Avatar>MB</Avatar>}
        label="Deletable Chip"
        onDelete={handleDelete}
        color={color}
      />
      <Chip
        avatar={
          <Avatar>
            <FaceIcon />
          </Avatar>
        }
        label="Clickable Deletable Chip"
        onClick={handleClick}
        onDelete={handleDelete}
        color={color}
      />
      <Chip
        icon={<FaceIcon />}
        label="Clickable Deletable Chip"
        onClick={handleClick}
        onDelete={handleDelete}
        color={color}
      />
      <Chip
        label="Custom delete icon Chip"
        onClick={handleClick}
        onDelete={handleDelete}
        deleteIcon={<DoneIcon />}
        color={color}
      />
      <Chip label="Clickable Link Chip" component="a" href="#chip" clickable color={color} />
    </div>
  );
};
