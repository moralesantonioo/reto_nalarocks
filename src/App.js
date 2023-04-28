import React, { useState } from 'react';
import * as XLSX from 'xlsx';
import moment from 'moment';
import Tree from "react-d3-tree";
import './index.css'


function App() {
  const [data, setData] = useState([]);
  const [filteredData, setFilteredData] = useState([]);
  const [selectedMonth, setSelectedMonth] = useState('');
  const [totalPaid, setTotalPaid] = useState(0);
  const [promotions, setPromotions] = useState(false);
  const [newHires, setNewHires] = useState(false);

  const handleFile = (event) => {
    const file = event.target.files[0];
    const reader = new FileReader();
    reader.onload = (event) => {
      const workbook = XLSX.read(event.target.result, { type: 'binary' });
      const sheetName = workbook.SheetNames[0];
      const worksheet = workbook.Sheets[sheetName];
      const rows = XLSX.utils.sheet_to_json(worksheet, { header: 1, raw: false });
      setData(rows);
      setFilteredData(rows);
    };
    reader.readAsBinaryString(file);
  };

  const handleFilterByMonth = (month) => {
    const filteredRows = data.filter((row) => {
      if (row[3] !== 'Fecha de ingreso') {
        const rowDate = moment(row[3], 'MM/DD/YYYY');
        return rowDate.month() === month;
      }
    });
    setFilteredData(filteredRows);
    setSelectedMonth(moment().month(month).format('MMMM'));
    setTotalPaid(calculateTotalPaid(filteredRows));
    setPromotions(checkForPromotions(filteredRows));
    setNewHires(checkForNewHires(filteredRows));
  };

  const limpiar = () => {
    setFilteredData(data);
    setSelectedMonth('');
    setTotalPaid(0);
    setPromotions(false);
    setNewHires(false);
  };

  const calculateTotalPaid = (filteredRows) => {
    let totalPaid = 0;
    filteredRows.forEach((row) => {
      totalPaid += parseInt(row[4]);
    });
    return totalPaid;
  };

  const checkForPromotions = (filteredRows) => {
    return filteredRows.some((row) => {
      return row[5] !== 'No';
    });
  };

  const checkForNewHires = (filteredRows) => {
    return filteredRows.some((row) => {
      return row[5] === 'No';
    });
  };

  const rootNode = {
    name: "Ceo",
    children: filteredData.map((item) => ({
      name: item[1],
      attributes: { position: item[6], salary: item[2] },
      children: [],
    })),
  }


  return (
    <div className="App">
      <input className="file-input" type="file" onChange={handleFile} accept=".xlsx, .csv" />
      {filteredData.length > 0 && (
        <>
          <h2>Filtrar por mes:</h2>
          <select className="filter-select" onChange={(e) => handleFilterByMonth(parseInt(e.target.value))}>
            <option value="">Seleccionar</option>
            <option value="0">Enero</option>
            <option value="1">Febrero</option>
            <option value="2">MarZO</option>
            <option value="3">Abril</option>
            <option value="4">Mayo</option>
            <option value="5">Junio</option>
            <option value="6">Julio</option>
            <option value="7">Agosto</option>
            <option value="8">Septiembre</option>
            <option value="9">Octucbre</option>
            <option value="10">Noviembre</option>
            <option value="11">Deciembre</option>
          </select>
          <button className="limpiar" onClick={limpiar}>Limpiar filtros</button>
          <table>
            {selectedMonth === 'January' ? <thead>
              <tr>
                <td>Mes</td>
                <td>Nombre</td>
                <td>Id</td>
                <td>Fecha Ingreso</td>
                <td>Sueldo</td>
              </tr>
            </thead> : ''}
            <tbody>
              {filteredData.map((row, index) => {
                return (
                  <tr key={index}>
                    <td>{row[0]}</td>
                    <td>{row[1]}</td>
                    <td>{row[2]}</td>
                    <td>{row[3]}</td>
                    <td>{row[4]}</td>
                  </tr>
                );
              })}
            </tbody>
          </table>
          {selectedMonth && (
            <>
              <div class="nomina-resumen">
                <h3>Resumen de nómina para {selectedMonth === 'January' ? 'Enero' : ''}:</h3>
                <p>Total pagado: ${totalPaid}</p>
                {promotions && <p>Alguien fue promovido este mes</p>}
                {newHires && <p>Alguien fue contratado este mes</p>}
              </div>

            </>
          )}
          <div className="organigrama">
            <Tree
              data={[rootNode]}
              translate={{ x: 750, y: 100 }}
              orientation="vertical"
              nodeSize={{ x: 250, y: 160 }}       
            />
          </div>
        </>
      )}
    </div>
  );
}
export default App;
