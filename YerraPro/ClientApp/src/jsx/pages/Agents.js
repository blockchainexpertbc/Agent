import React, { Fragment, useState, useEffect } from "react";
import {  Pagination, Badge, Dropdown, Button, Modal, Table } from "react-bootstrap";
import { Link } from "react-router-dom";
import axios from 'axios'
import { BASE_URL } from "../../constance/index.js";
import { useInterval } from "../components/UseInterval.js";
import Select from "react-select";
import { useSelector } from "react-redux"
import authHeader from "../components/AuthHeader.js";

const StatusComponent = ({state}) => {
   switch (state) {
      case 0:
         return <Badge variant="primary light">
            <i className="fa fa-circle text-success mr-1"></i>
            Installed
         </Badge>
      case 1:
           return <Badge variant="success light">
               <i className="fa fa-circle text-warning mr-1"></i>
            Running
         </Badge>
      case 2:
           return <Badge variant="danger light">
               <i className="fa fa-circle text-danger mr-1"></i>
            Stoped
           </Badge>
       case 3:
           return <Badge variant="warning light">
               <i className="fa fa-circle text-danger mr-1"></i>
               Uninstalled
           </Badge>
      case 4:
           return <Badge variant="secondary light">
               <i className="fa fa-circle text-success mr-1"></i>
               Turned off
           </Badge>
      default:
           return <Badge variant="secondary light">
            <i className="fa fa-circle text-success mr-1"></i>
            Turned off
         </Badge>
   }
}

const Agents = (props) => {

    const [agents, setAgents] = useState([])
    const [processes, setprocesses] = useState([])
    const [filteredAgents, setFilteredAgents] = useState([]);
    const [currentPage, setCurrentPage] = useState(0);
    const [byFilter, setByFilter] = useState(100);
    const [searchKey, setSearchKey] = useState('');
    const [paggination, setPaggination] = useState([]);
    const [modalCentered, setModalCentered] = useState(false);
    const [selectedProcesses, setselectedProcesses] = useState('');
    const companyId = useSelector(state => state.auth.auth.companyId);
    const sort = 8;

    useEffect(() => {
        axios.get(`${BASE_URL}/api/agent/byCompanyId/${companyId}`, { headers: authHeader() })
            .then(res => {
                setAgents(res.data);
            });
        axios.get(`${BASE_URL}/api/process/-1`, { headers: authHeader() })
            .then(res => {
                setprocesses(res.data.map(c => ({ id: c.id, label: c.label, value: c.label })));
            });
    }, [])

    useInterval(() => {
        axios.get(`${BASE_URL}/api/agent/byCompanyId/${companyId}`, { headers: authHeader() })
            .then(res => {
                console.log(res.data);
                setAgents(res.data);
            });
    }, 5000)
   
    useEffect(() => {

        let cnt = agents.length > sort ? sort : (agents.length - currentPage * sort);
        setFilteredAgents(agents.filter(o => byFilter === 100 ? true : o.status === byFilter).slice(currentPage * sort, currentPage * sort + cnt));

    }, [agents, currentPage, byFilter])

    useEffect(() => {
        let paggination = Array(Math.ceil(agents.filter(o => byFilter === 100 ? true : o.status === byFilter).length / sort))
            .fill()
            .map((_, i) => i + 1);
        setPaggination(paggination);
        if (paggination.length - 1 < currentPage) {
            setCurrentPage(0);
        }

    }, [filteredAgents])

    const onSetAgentState = ({ status, agent }) => {
        if (status === 100) {
            props.history.push(`/processes/${agent.id}`);
            return;
        }
        agent.status = status;
        axios.put(`${BASE_URL}/api/agent`, agent)
            .then(res => {
                let changedAgents = agents.map(a => {
                    if (a.id === res.data.id) {
                        return res.data;
                    }
                    return a;
                })
                setAgents(changedAgents);
            });
    }
   
  
    
    const newAgent = () => {
        //axios.post(`${BASE_URL}/api/agent`, { companyId: company.id })
        //    .then(res => {
        //        setAgents([res.data, ...agents]);
        //        axios({
        //            url: `${BASE_URL}/api/agent/download`,
        //            method: 'GET',
        //            responseType: 'blob', // important
        //        })
        //            .then(res => {
        //                const url = window.URL.createObjectURL(new Blob([res.data]));
        //                const link = document.createElement('a');
        //                link.href = url;
        //                link.setAttribute('download', 'archive.zip');
        //                document.body.appendChild(link);
        //                link.click();
        //            })
        //    })
    }

    const deleteAgent = id => {
        axios.delete(`${BASE_URL}/api/agent/${id}`)
            .then(res => {
                setAgents(agents.filter(a => a.id !== res.data.id));
            })
    }

    const byFilterLabel = id => {
        switch (id) {
            case 0:
                return 'Installed';
            case 1:
                return 'Starting';
            case 2:
                return 'Stoped';
            case 3:
                return 'Uninstalled';
            case 4:
                return 'Turned off';
            default:
                return 'All';
        }
    }
   
   return (
      <Fragment>
            <div className="row mb-3">
               <div className="col-md-12 text-right">
                   <Button variant="info btn-rounded" onClick={() => setModalCentered(true)}>
                        <span className="btn-icon-left text-info">
                           <i className="fa fa-plus color-info" />
                        </span>
                        Create a agent
                   </Button>

                   <Modal className="fade" show={modalCentered}>
                       <Modal.Header>
                           <Modal.Title>Modal title</Modal.Title>
                           <Button
                               onClick={() => setModalCentered(false)}
                               variant=""
                               className="close"
                           >
                               <span>&times;</span>
                           </Button>
                       </Modal.Header>
                       <Modal.Body>
                           <div className="form-group">
                               <div className="form-group row">
                                   <label className="col-sm-3 col-form-label">
                                       Select the processes
                                   </label>
                                   <div className="col-sm-9">
                                       <Select
                                           multi
                                           onChange={setselectedProcesses}
                                           options={processes}
                                           style={{
                                               lineHeight: "40px",
                                               color: "#7e7e7e",
                                               paddingLeft: " 15px",
                                           }}
                                       />
                                   </div>
                               </div>

                           </div>
                       </Modal.Body>
                       <Modal.Footer>
                           <Button
                               onClick={() => setModalCentered(false)}
                               variant="danger light"
                           >
                               Close
                           </Button>
                           <Button variant="primary" onClick={newAgent}>Create Agent</Button>
                       </Modal.Footer>
                   </Modal>

               </div>
            </div>
         <div className="row">
            <div className="col-12">
                <div className="card">
                    <div className="card-header">
                        <h4 className="card-title">Agents</h4>
                        <div className="input-group search-area d-lg-inline-flex d-none mr-5">
                            <input
                                type="text"
                                value={searchKey}
                                className="form-control"
                                placeholder="Search here"
                                onChange={e => setSearchKey(e.target.value)}
                            />
                            <div className="input-group-append">
                                <span className="input-group-text">
                                    <svg
                                        width={20}
                                        height={20}
                                        viewBox="0 0 24 24"
                                        fill="none"
                                        xmlns="http://www.w3.org/2000/svg"
                                    >
                                        <path
                                            d="M23.7871 22.7761L17.9548 16.9437C19.5193 15.145 20.4665 12.7982 20.4665 10.2333C20.4665 4.58714 15.8741 0 10.2333 0C4.58714 0 0 4.59246 0 10.2333C0 15.8741 4.59246 20.4665 10.2333 20.4665C12.7982 20.4665 15.145 19.5193 16.9437 17.9548L22.7761 23.7871C22.9144 23.9255 23.1007 24 23.2816 24C23.4625 24 23.6488 23.9308 23.7871 23.7871C24.0639 23.5104 24.0639 23.0528 23.7871 22.7761ZM1.43149 10.2333C1.43149 5.38004 5.38004 1.43681 10.2279 1.43681C15.0812 1.43681 19.0244 5.38537 19.0244 10.2333C19.0244 15.0812 15.0812 19.035 10.2279 19.035C5.38004 19.035 1.43149 15.0865 1.43149 10.2333Z"
                                            fill="#A4A4A4"
                                        />
                                    </svg>
                                </span>
                            </div>
                        </div>
                    <Dropdown className="dropdown mt-sm-0 mt-3">
                        <Dropdown.Toggle
                            as="button"
                            variant=""
                            className="btn rounded border border-light dropdown-toggle"
                        >
                            {byFilterLabel(byFilter)}
                        </Dropdown.Toggle>
                            <Dropdown.Menu className="dropdown-menu dropdown-menu-right">
                            <Dropdown.Item onClick={ () => setByFilter(100)}>All</Dropdown.Item>
                            <Dropdown.Item onClick={() => setByFilter(0)}>Installed</Dropdown.Item>
                            <Dropdown.Item onClick={() => setByFilter(1)}>Started</Dropdown.Item>
                            <Dropdown.Item onClick={() => setByFilter(2)}>Stopped</Dropdown.Item>
                            <Dropdown.Item onClick={() => setByFilter(3)}>Uninstalled</Dropdown.Item>
                            <Dropdown.Item onClick={() => setByFilter(2)}>Turned off</Dropdown.Item>
                        </Dropdown.Menu>
                    </Dropdown>
                    </div>
                    <div className="card-body">
                        <div id="example_wrapper" className="dataTables_wrapper">
                            <table id="example" className="display w-100 dataTable">
                                <thead>
                                <tr role="row">
                                        <th >
                                            Liecense
                                        </th>
                                        <th>
                                            Machine ID
                                        </th>
                                        <th>
                                            IP Address
                                        </th>
                                        <th>
                                            Created At
                                        </th>
                                        <th>
                                            Updated At
                                        </th>
                                        <th className="text-center">
                                            Status
                                        </th>
                                        <th>
                                            Actions
                                        </th>
                                </tr>
                                </thead>
                                <tbody>
                                    {
                                        filteredAgents
                                        .map(a => (
                                        <tr key={a.id}>
                                            <td>
                                                {a.id}
                                            </td>
                                            <td>
                                                    {a.machineID}
                                            </td>
                                            <td className="text-center">
                                                    {a.ipAddress}
                                            </td>
                                                <td>
                                                    {a.createdAt}
                                            </td>
                                            <td className="text-center">
                                                    {a.updatedAt}
                                            </td>
                                            <td className="text-center">
                                                <StatusComponent state={a.status} />
                                            </td>
                                            <td>
                                                <Dropdown>
                                                    <Dropdown.Toggle
                                                        variant
                                                        className="icon-false table-dropdown"
                                                    >
                                                        <svg
                                                            width="24px"
                                                            height="24px"
                                                            viewBox="0 0 24 24"
                                                            version="1.1"
                                                        >
                                                            <g
                                                                stroke="none"
                                                                strokeWidth="1"
                                                                fill="none"
                                                                fillRule="evenodd"
                                                            >
                                                                <rect
                                                                    x="0"
                                                                    y="0"
                                                                    width="24"
                                                                    height="24"
                                                                ></rect>
                                                                <circle
                                                                    fill="#000000"
                                                                    cx="5"
                                                                    cy="12"
                                                                    r="2"
                                                                ></circle>
                                                                <circle
                                                                    fill="#000000"
                                                                    cx="12"
                                                                    cy="12"
                                                                    r="2"
                                                                ></circle>
                                                                <circle
                                                                    fill="#000000"
                                                                    cx="19"
                                                                    cy="12"
                                                                    r="2"
                                                                ></circle>
                                                            </g>
                                                        </svg>
                                                    </Dropdown.Toggle>
                                                        <Dropdown.Menu>
                                                            <Dropdown.Item to="#" onClick={() => onSetAgentState({ status: 1, agent: a })}>
                                                            Start
                                                        </Dropdown.Item>
                                                        <Dropdown.Item to="#" onClick={() => onSetAgentState({ status: 2, agent: a })}>
                                                            Stop
                                                        </Dropdown.Item>
                                                        <Dropdown.Item to="#" onClick={() => onSetAgentState({ status: 3, agent: a })}>
                                                            Uninstall
                                                        </Dropdown.Item>
                                                        <Dropdown.Item to="#" onClick={() => deleteAgent(a.id)}>
                                                            Delete
                                                        </Dropdown.Item>
                                                        <Dropdown.Item to="#">
                                                            View Details
                                                        </Dropdown.Item>
                                                        <Dropdown.Item to="#" onClick={() => onSetAgentState({ status: 100, agent: a })}>
                                                            View Process list
                                                        </Dropdown.Item>
                                                    </Dropdown.Menu>
                                                </Dropdown>
                                            </td>
                                            </tr>

                                            ))
                                    }
                                    </tbody>
                            </table>
                            <div className="d-flex justify-content-between align-items-center mt-3">
                                <div className="dataTables_info">
                                    Showing {currentPage * sort + 1} to 
                                    {filteredAgents.length >
                                        (currentPage + 1) * sort
                                        ? filteredAgents.length
                                        : (currentPage + 1) * sort}
                                    of {agents.length} entries
                                </div>
                                <div className="dataTables_paginate paging_simple_numbers">
                                <Pagination
                                    className="pagination-primary pagination-circle"
                                    size="lg"
                                >
                                    <li
                                        className="page-item page-indicator "
                                            onClick={() =>
                                                currentPage > 0 &&
                                                setCurrentPage(currentPage - 1)
                                        }
                                    >
                                        <Link className="page-link" to="#">
                                            <i className="la la-angle-left" />
                                        </Link>
                                    </li>
                                    {
                                        paggination.map((number, i) => (
                                            <Pagination.Item 
                                                className={
                                                    currentPage === i ? "active" : ""
                                                }
                                            onClick={() => setCurrentPage(i)}
                                            key={i}
                                            >
                                            {number}
                                            </Pagination.Item>
                                        ))
                                    }
                                    <li
                                        className="page-item page-indicator"
                                            onClick={() =>
                                                currentPage + 1 <
                                                filteredAgents &&
                                                setCurrentPage(currentPage + 1)
                                        }
                                    >
                                        <Link className="page-link" to="#">
                                            <i className="la la-angle-right" />
                                        </Link>
                                    </li>
                                </Pagination>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>
            </div>
         </div>
      </Fragment>
   );
};

export default Agents;
