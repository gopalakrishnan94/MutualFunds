import React from 'react';
import { Panel, InputGroup, Input, Loader, List, Row, Col } from 'rsuite';
import SearchIcon from '@rsuite/icons/Search';
import CloseIcon from '@rsuite/icons/Close';
import { HTTP } from './crudService';
import ReactApexChart from 'react-apexcharts';

const MF = () => {

    const restData = {
        options: {
            chart: {
                id: 'area-datetime',
                type: 'area',
                height: 350,
                animations: {
                    initialAnimation: {
                        enabled: false
                    }
                }
            },
            xaxis: {
                type: "datetime"
            },
            dataLabels: {
                enabled: false,
            },
            tooltip: {
                x: {
                    format: 'dd MMM yyyy'
                }
            }
        }
    }

    const [search, setSearch] = React.useState('');
    const [TotalData, setTotalData] = React.useState([]);
    const [ResultData, setResultData] = React.useState([]);
    const [SpecificData, setSpecificData] = React.useState([]);
    const [SpecificMeta, setSpecificMeta] = React.useState({});
    const [loader, setLoader] = React.useState(false);

    const handleSearchChange = (ev) => {
        setSearch(ev)
        if (ev === "" || ev === null) {
            setResultData([])
        }
    }

    const fireSearch = (e) => {
        if (e.key === 'Enter') {
            handleSearchSubmit();
        }
    }

    const handleSearchSubmit = () => {
        if (search != null && search.length > 2) {
            setResultData(TotalData.filter(x => x.schemeName.toLowerCase().includes(search.toLowerCase())))
        } else {
        }
    }

    const getSpecificData = async (ddSS) => {
        setLoader(true);
        try {
            await HTTP.get("/mf/" + ddSS)
                .then((res) => {
                    //console.log(res)
                    var ddSS = []
                    var ddSST = [];
                    res.data.data.forEach((dd) => {
                        dd.x = new Date(dd.date.split("-").reverse().join("/"));
                        dd.y = dd.nav;
                        ddSST.push(dd);
                    })
                    ddSS.push({ 
                        name: "NAV in Rs", 
                        data: ddSST 
                    })
                    setSpecificData(ddSS);
                    setSpecificMeta(res.data ? res.data.meta ? res.data.meta : {} : {})
                    setLoader(false);
                })
        } catch (err) {
            console.log(err);
            setLoader(false);
        }
    }

    const getData = async () => {
        try {
            await HTTP.get("/mf")
                .then((res) => {
                    if (res.data && res.data.length > 0) {
                        var datadd = res.data;
                        datadd.forEach((x, ind1) => x.index = ind1)
                        setTotalData(datadd)
                    } else {
                        setTotalData([])
                        setResultData([])
                    }
                    setLoader(false);
                })
        } catch (err) {
            console.log(err);
            setLoader(false);
        }
    }

    const handleSearchClear = () => {
        setSearch('');
        setTotalData([]);
        setResultData([]);
        setSpecificData([])
        setSpecificMeta({})
        getData();
    }

    React.useEffect(() => {
        getData();
        // eslint-disable-next-line
    }, []);

    return (
        <div>
            <h4 style={{ textAlign: 'center' }}>Mutual Funds List</h4>
            <Panel header="Search" bordered shaded style={{ marginLeft: '5px' }}>
                <InputGroup>
                    <Input placeholder="search" value={search} onKeyDown={fireSearch} onChange={handleSearchChange} />
                    <InputGroup.Button onClick={handleSearchClear}><CloseIcon /></InputGroup.Button>
                    <InputGroup.Button onClick={handleSearchSubmit}><SearchIcon /></InputGroup.Button>
                </InputGroup>
            </Panel>
            <br />
            {loader ? <Loader backdrop content="loading..." vertical /> : null}
            <Panel header="Searched Results" bordered shaded style={{ marginLeft: '5px' }}>
                <Row>
                    <Col lg={9} md={9}>
                        <List size="sm" bordered hover style={{ height: '450px' }}>
                            {ResultData.map((ite1, iid1) => (
                                <List.Item key={ite1.index} style={{ cursor: 'pointer' }} onClick={() => getSpecificData(ite1.schemeCode)}>
                                    {ite1.schemeName}
                                </List.Item>
                            ))}
                        </List>
                    </Col>
                    <Col lg={14} md={14}>
                        <List size="sm" bordered hover>
                            <List.Item> Fund House : {SpecificMeta.fund_house}</List.Item>
                            <List.Item> Schema Name : {SpecificMeta.scheme_name}</List.Item>
                            <List.Item> Category : {SpecificMeta.scheme_category}</List.Item>
                        </List>
                        <ReactApexChart options={restData.options} series={SpecificData} type="area" height={350} />
                    </Col>
                </Row>
            </Panel>
        </div>
    );
}

export default MF;