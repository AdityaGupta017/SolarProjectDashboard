import * as React from "react";
import axios from "axios";
import { useState, useEffect } from "react";
import Link from "@mui/material/Link";
import Table from "@mui/material/Table";
import TableBody from "@mui/material/TableBody";
import TableCell from "@mui/material/TableCell";
import TableHead from "@mui/material/TableHead";
import TableRow from "@mui/material/TableRow";
import Title from "./Title";
import theme from "../theme";
import { ThemeProvider } from "@mui/material/styles";
import { useNavigate } from "react-router-dom";
import {
    Dialog,
    DialogActions,
    DialogContent,
    DialogTitle,
    InputAdornment,
    TextField,
} from "@mui/material";
import Box from "@mui/material/Box";
import AccountCircle from "@mui/icons-material/AccountCircle";
import PhoneIcon from "@mui/icons-material/Phone";
import AddHomeIcon from "@mui/icons-material/AddHome";
import LocationOnIcon from "@mui/icons-material/LocationOn";
import Button from "@mui/material/Button";
import CalendarMonthIcon from "@mui/icons-material/CalendarMonth";

// Generate Order Data

export default function OngoingProject({ showMoreLink = true }) {
    const navigate = useNavigate();
    const [openDialog, setOpenDialog] = useState(false);
    const [customerName, setCustomerName] = useState("");
    const [customerNumber, setCustomerNumber] = useState(0);
    const [customerAddress, setCustomerAddress] = useState("");
    const [projectAddress, setProjectAddress] = useState("");
    const [date, setDate] = useState(new Date());
    const [editprojectID, setEditprojectID] = useState("");

    const handleOpenDialog = async () => {
        await GetEditCustomer(editprojectID);
        setOpenDialog(true);
    };

    const handleCloseDialog = () => {
        setOpenDialog(false);
    };

    const handleAddSubmit = async (e) => {
        e.preventDefault();
        try {
            const updateddata = {
                projectId: editprojectID,
                customerName: customerName,
                customerNumber: customerNumber,
                customerAddress: customerAddress,
                projectAddress: projectAddress,
                date: date,
            };
            const token = localStorage.getItem("token");
            const response = await axios.patch(
                `${process.env.REACT_APP_API_URL}customer_patch`,
                updateddata,
                {
                    headers: {
                        Authorization: `Bearer ${token}`,
                    },
                }
            );
            if (response.status === 200) {
                alert("Project Details Edited Successfully");
                window.location.reload();
                Getongoingproject();
            }
        } catch (error) {
            console.error(error);
        }
    };

    const handleSeeMoreClick = (event) => {
        event.preventDefault();
        navigate("/sales/ongoingprojects"); // replace with the desired path
    };

    const handleButton = async (type, id) => {
        if (type === "Edit") {
            setEditprojectID(id);
            handleOpenDialog();
        } else {
            try {
                const token = localStorage.getItem("token");
                const response = await axios.patch(
                    `${process.env.REACT_APP_API_URL}projectstatus`,
                    { type, id },
                    { headers: { Authorization: `Bearer ${token}` } }
                );
                if (response.status === 200) {
                    let tempType = type;
                    if (tempType === "Cancel") {
                        tempType = "Cancell";
                    }
                    alert(`Project ${tempType} Successfully`);
                    window.location.reload();
                }
            } catch (error) {
                console.error(error);
            }
        }
    };

    function ButtonArray(id) {
        const buttonArray = ["Edit", "Finish", "Cancel"];
        return (
            <div>
                {buttonArray.map((buttonText, index) => (
                    <button
                        style={{ marginLeft: "10px" }}
                        key={index}
                        onClick={() => handleButton(buttonArray[index], id)}
                    >
                        {buttonText}
                    </button>
                ))}
            </div>
        );
    }

    const [ongoing, getongoing] = useState();

    async function Getongoingproject() {
        const token = localStorage.getItem("token");
        try {
            const response = await axios.get(
                `${process.env.REACT_APP_API_URL}inprogress`,
                {
                    headers: {
                        Authorization: `Bearer ${token}`,
                    },
                }
            );
            const data = await response.data;
            getongoing(data);
        } catch (error) {
            console.log(error);
        }
    }

    const [editCustomer, setEditCustomer] = useState([]);
    async function GetEditCustomer(Id) {
        const token = localStorage.getItem("token");
        let path = `${process.env.REACT_APP_API_URL}customer/${Id}`;
        const response = await axios.get(`${path}`, {
            headers: {
                Authorization: `Bearer ${token}`,
            },
        });
        const data = await response.data;
        setEditCustomer(data);
        setCustomerName(data.customerName);
        setCustomerNumber(data.customerNumber);
        setCustomerAddress(data.customerAddress);
        setProjectAddress(data.projectAddress);
        setDate(data.projectAppointmentDate);
    }

    useEffect(() => {
        Getongoingproject();
    }, []);

    if (!ongoing) return <div>No Ongoing Projects</div>;

    const handleProjectClick = (event, projectId) => {
        event.preventDefault();
        localStorage.setItem("projectId", projectId);
        navigate("/sales/projectdetails");
    };

    return (
        <ThemeProvider theme={theme}>
            <React.Fragment>
                <Title>On-Going Projects</Title>
                <Table size="small">
                    <TableHead>
                        <TableRow>
                            <TableCell>Product Address</TableCell>
                            <TableCell>Customer Name</TableCell>
                            <TableCell>Date</TableCell>
                            <TableCell>Cost</TableCell>
                            <TableCell>Status</TableCell>
                            <TableCell>Action</TableCell>
                        </TableRow>
                    </TableHead>
                    <TableBody>
                        {ongoing.map((row) => (
                            <TableRow key={row.id}>
                                <TableCell
                                    onClick={(event) =>
                                        handleProjectClick(event, row._id)
                                    }
                                >
                                    {row.projectAddress}
                                </TableCell>
                                <TableCell>{row.customerName}</TableCell>
                                <TableCell>{row.startDate}</TableCell>
                                <TableCell>
                                    {`${
                                        row.totalCost === "Not Assigned"
                                            ? 0
                                            : row.totalCost
                                    }`}
                                </TableCell>

                                <TableCell
                                    style={{
                                        color:
                                            row.projectStatus === "Pending"
                                                ? theme.palette.error.main
                                                : row.projectStatus ===
                                                  "In-Progress"
                                                ? theme.palette.warning.main
                                                : "",
                                    }}
                                >
                                    {row.projectStatus}
                                </TableCell>
                                <TableCell>{ButtonArray(row._id)}</TableCell>
                            </TableRow>
                        ))}
                    </TableBody>
                </Table>
                {/* Dialog Box Starts from here */}
                <Dialog open={openDialog} onClose={handleCloseDialog}>
                    <DialogTitle style={{ textAlign: "center" }}>
                        Edit Customer
                    </DialogTitle>
                    <DialogContent>
                        <Box
                            sx={{
                                display: "flex",
                                flexDirection: "column",
                                gap: "16px",
                                mt: "20px",
                            }}
                        >
                            <TextField
                                id="customer-name"
                                label="Customer Name"
                                variant="outlined"
                                defaultValue={editCustomer.customerName}
                                onChange={(e) =>
                                    setCustomerName(
                                        e.target.value ||
                                            editCustomer.customerName
                                    )
                                }
                                InputProps={{
                                    startAdornment: (
                                        <InputAdornment position="start">
                                            <AccountCircle
                                                sx={{
                                                    color: "action.active",
                                                    m: 0.5,
                                                }}
                                            />
                                        </InputAdornment>
                                    ),
                                }}
                            />
                            <TextField
                                id="customer-number"
                                label="Customer Number"
                                variant="outlined"
                                defaultValue={editCustomer.customerNumber}
                                onChange={(e) =>
                                    setCustomerName(
                                        e.target.value ||
                                            editCustomer.customerNumber
                                    )
                                }
                                InputProps={{
                                    startAdornment: (
                                        <InputAdornment position="start">
                                            <PhoneIcon
                                                sx={{
                                                    color: "action.active",
                                                    m: 0.5,
                                                }}
                                            />
                                        </InputAdornment>
                                    ),
                                }}
                            />
                            <TextField
                                id="customer-address"
                                label="Customer Address"
                                variant="outlined"
                                defaultValue={editCustomer.customerAddress}
                                onChange={(e) =>
                                    setCustomerAddress(
                                        e.target.value ||
                                            editCustomer.customerAddress
                                    )
                                }
                                InputProps={{
                                    startAdornment: (
                                        <InputAdornment position="start">
                                            <AddHomeIcon
                                                sx={{
                                                    color: "action.active",
                                                    m: 0.5,
                                                }}
                                            />
                                        </InputAdornment>
                                    ),
                                }}
                            />
                            <TextField
                                id="project-address"
                                label="Project Address"
                                variant="outlined"
                                defaultValue={editCustomer.projectAddress}
                                onChange={(e) =>
                                    setProjectAddress(
                                        e.target.value ||
                                            editCustomer.projectAddress
                                    )
                                }
                                InputProps={{
                                    startAdornment: (
                                        <InputAdornment position="start">
                                            <LocationOnIcon
                                                sx={{
                                                    color: "action.active",
                                                    m: 0.5,
                                                }}
                                            />
                                        </InputAdornment>
                                    ),
                                }}
                            />
                            <TextField
                                id="appointment-date"
                                label="Appointment Date"
                                variant="outlined"
                                defaultValue={
                                    editCustomer.projectAppointmentDate
                                }
                                type="datetime-local"
                                onChange={(e) =>
                                    setDate(
                                        e.target.value ||
                                            editCustomer.projectAppointmentDate
                                    )
                                }
                                InputProps={{
                                    startAdornment: (
                                        <InputAdornment position="start">
                                            <CalendarMonthIcon
                                                sx={{
                                                    color: "action.active",
                                                    m: 0.5,
                                                }}
                                            />
                                        </InputAdornment>
                                    ),
                                }}
                            />
                        </Box>
                    </DialogContent>
                    <DialogActions>
                        <Button
                            variant="outlined"
                            onClick={handleCloseDialog}
                            color="primary"
                        >
                            Cancel
                        </Button>
                        <Button
                            variant="outlined"
                            onClick={handleAddSubmit}
                            color="secondary"
                        >
                            Submit
                        </Button>
                    </DialogActions>
                </Dialog>
                {/* Dialog Box Ends here */}
                {showMoreLink && (
                    <Link
                        color="primary"
                        href="#"
                        onClick={handleSeeMoreClick}
                        sx={{ mt: 3 }}
                    >
                        See more Projects
                    </Link>
                )}
            </React.Fragment>
        </ThemeProvider>
    );
}
