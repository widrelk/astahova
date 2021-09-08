import React, {useEffect, useState, useRef} from "react"
const Lab1 = () => {

    const [matrixWin, setmatrixWin] = useState(null)
    const [matrixRisk, setmatrixRisk] = useState(null)

    const [matrix, setMatrix] = useState(null)
    const [risks, setRisks] = useState(null)

    const [waldRes, setWaldRes] = useState(0)
    const [probRes, setProbRes] = useState("не рассчитана")
    const [sawRes, setSawRes] = useState(0)
    const [gurwResWin, setGurwResWin] = useState("не рассчитана")
    const [gurwResRisk, setGurwResRisk] = useState("не рассчитана")

    const gurwInput = useRef()
    const probInput = useRef()

    const handleCalculate = (id) => {
        // По хорошему надо было оформить как хук
        let [rowsCount, columnsCount] = matrixWin[0]
            // Читаем матрицу
        let matrixData = matrixWin.slice(1)
        if (id === 1) {
            // Вероятности
            let coeffs = probInput.current.value
            coeffs = coeffs.split(' ').map((coeff) => {return Number(coeff)})

            let min = 10000, res = 0
            matrixRisk.forEach((row, rowIndex) => {
                let rowRisk = 0;
                row.forEach((elem, colIndex) => { rowRisk += elem * coeffs[colIndex]})
                if (rowRisk < min) {
                    min = rowRisk
                    res = rowIndex
                }
            })
            setProbRes(res + 1)
        } else {
            // Гурвиц
            let coeff = gurwInput.current.value
            coeff = Number(coeff)
            
            let max = 0
            let result = 0
            for (let row = 0; row < rowsCount; row++) {
                let rowMax = Math.max(...matrixData[row]), rowMin = Math.min(...matrixData[row])
                if (coeff * rowMin + (1 - coeff) * rowMax > max) {
                    max = coeff * rowMin + (1 - coeff) * rowMax
                    result = row
                }
            }
            setGurwResWin(result + 1)
            
            let min = 10000
            result = 0
            for (let row = 0; row < rowsCount; row++) {
                let rowMax = Math.max(...matrixRisk[row]), rowMin = Math.min(...matrixRisk[row])
                if (coeff * rowMax + (1 - coeff) * rowMin < min) {
                    min = coeff * rowMin + (1 - coeff) * rowMax
                    result = row
                }
            }
            setGurwResRisk(result + 1)
        }
    }

    useEffect(() => {
        fetch("/Lab1.txt").then((fileRes) => {
            fileRes.text().then((text) => {
                let rows = text.split('\r\n')
                let data = rows.map((row) => {
                    return row.split(' ').map((elem) => {return Number(elem)})
                })
                setmatrixWin(data)
            })
        })
    }, []);

    useEffect(() => {
        if (matrixWin) {
            let [rowsCount, columnsCount] = matrixWin[0]
            // Читаем матрицу
            let matrixData = matrixWin.slice(1)
            let rows = matrixData.map((row) => {
                return (<tr>{row.map((cell) => {return <td>{cell}</td>})}</tr>)
            })
            setMatrix(rows)
            // Считаем риски
            let risks = JSON.parse(JSON.stringify(matrixData))
            for (let currentColumn = 0; currentColumn < columnsCount; currentColumn++) {
                let max = risks[0][currentColumn]
                for (let currentRow = 1; currentRow < rowsCount; currentRow++) {
                    if (max < risks[currentRow][currentColumn]){
                        max = risks[currentRow][currentColumn]
                    }
                }
                
                for (let currentRow = 0; currentRow < rowsCount; currentRow++) {
                    risks[currentRow][currentColumn] = max - risks[currentRow][currentColumn]
                }
            }
            setmatrixRisk(risks)
            rows = risks.map((row) => {
                return (<tr>{row.map((cell) => {return <td>{cell}</td>})}</tr>)
            })
            setRisks(rows);

            // Считаем Вальда
            let wald = 0
            let max = 0
            for (let currentRow = 0; currentRow < rowsCount; currentRow++){
                let rowMin = matrixData[currentRow][0]
                for (let currentColumn = 0; currentColumn < columnsCount; currentColumn++){
                    if (matrixData[currentRow][0] < rowMin){
                        rowMin = matrixData[currentRow][0]
                    }
                }
                if (rowMin > max) {
                    max = rowMin;
                    wald = currentRow
                }
            }
            setWaldRes(wald + 1)
            // Считаем Сэвиджа
            let saw = 0
            let min = 10000
            for (let currentRow = 0; currentRow < rowsCount; currentRow++){
                let rowMax = risks[currentRow][0]
                for (let currentColumn = 0; currentColumn < columnsCount; currentColumn++){
                    if (risks[currentRow][0] > rowMax){
                        rowMax = risks[currentRow][0]
                    }
                }
                if (rowMax < min) {
                    min = rowMax;
                    saw = currentRow
                }
            }
            setSawRes(saw + 1)
            

        }
    },[matrixWin])

    return(
    <div>
        <h3>Лабораторная работа 1</h3>
        <p>Управление проектами. Формализированные методы оценки рисков в управлении IT-проектами</p>
        <div style={{display: "flex"}}>
            <div style={{margin:"auto", flex:1}}>
                <p class="tableTitle">Исходная матрица</p>
                <table >{matrix}</table>
            </div>
            <div style={{margin:"auto", flex:1}}>
                <p class="tableTitle">Матрица рисков</p>
                <table>{risks}</table>
            </div>
        </div>

        <p>Принятые решения:</p>
        <div style={{display: "flex"}}>
            <div style={{margin:"7px", flex:1}}>
                <p>Критерий Сэвиджа</p>
                <p style={{fontSize:"small"}}>Оптимальная стратегия - {sawRes}</p>
            </div>

            <div style={{margin:"7px", flex:1}}>
                <p>Критерий Вальда</p>
                <p style={{fontSize:"small"}}>Оптимальная стратегия - {waldRes}</p>
            </div>
        </div>


        <div style={{display: "flex"}}>   
            <div style={{margin:"7px", flex:1}}>
                <p>Критерий, основанный на известных вероятностях условий</p>
                <p style={{fontSize:"small"}}>{"Введите вероятности для каждой из стратегий П (0 < Qi < 1), через пробел"}</p>
                <input type="text" ref={probInput} placeholder="0.5 0.5"/>
                <button onClick={() => handleCalculate(1)}>рассчитать</button>
                <p style={{fontSize:"small"}}>Оптимальная стратегия - {probRes}</p>
            </div>

            <div style={{margin:"7px", flex:1}}>
                <p>Критерий Гурвица</p>
                <p style={{fontSize:"small"}}>{"Введите количество пессисизма (> 0, < 1)"}</p>
                <input type="text" ref={gurwInput} placeholder="0.5"/>
                <button onClick={() => handleCalculate(2)}>рассчитать</button>
                <p style={{fontSize:"small"}}>Оптимальная стратегия из выигрыша - {gurwResWin}</p>
                <p style={{fontSize:"small"}}>Оптимальная стратегия из риска - {gurwResRisk}</p>

            </div>
        </div>
    </div>
    )
}

export default Lab1