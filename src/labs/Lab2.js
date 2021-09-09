import React, {useEffect, useState, useRef} from "react"
var _ = require("lodash")

const Lab2 = () => {
    const [givenTableRows, setGivenTableRows] = useState(null)
    const [givenData, setGivenData] = useState(null)

    useEffect(() => {
        fetch("/Lab2.txt").then((fileRes) => {
            fileRes.text().then((text) => {
                let rows = text.split('\r\n')
                let data = rows.map((row) => {
                    return row.split(' ').map((elem) => {return Number(elem)})
                })
                setGivenData(data)
            })
        })
    }, []);

    useEffect(() => {
        if (givenData) {
            setGivenTableRows(givenData.map((row) => {
                return(<tr><td>{row[0]}</td><td>{row[1]}</td><td>{row[2]}</td></tr>)
            }))
        
            let from = [], to = [], works = []
            givenData.forEach((row) => {
                if (!works[row[0]]) {       // Если исходной вершины ещё не было
                    works[row[0]] = [row]
                    from.push(row[0])
                    to.push(row[1])
                } else {
                    
                    debugger
                }
            })
            debugger
        }
    }, [givenData])

    return(
    <div>
        <h3>Лабораторная работа 2</h3>
        <p>Управление проектами. Упорядочение исходного списка работ сетевого графика</p>

        <div style={{display: "flex", maxWidth:"1200px"}}>
            <div style={{flex: 1}}>
                <h4>Исходный список работ</h4>
                <table>
                    <tr>
                        <td><b>A</b>: шифр предшествующего события</td>
                        <td><b>B</b>: шифр последующего события</td>
                        <td><b>T<sub>AB</sub></b>: продолжительность соответствующей работы, связывающей события с шифрами А и В (дни)</td>
                    </tr>
                    <tr>
                        <td colSpan="3" height="40px">
                            <form >
                                <input type="text" name="first" placeholder="A"/>
                                <input type="text" name="second" placeholder="B"/>
                                <input type="text" name="time" placeholder="T"/>
                                <input type="submit" value="Добавить в таблицу" />
                            </form>
                        </td>   
                    </tr>
                    {givenTableRows}
                </table>
            </div>
            <div style={{flex: 1, paddingLeft:"30px"}}>
                <h4>Упорядоченный список работ</h4>
                <table>
                    <tr>
                        <td><b>A</b>: шифр предшествующего события</td>
                        <td><b>B</b>: шифр последующего события</td>
                        <td><b>T<sub>AB</sub></b>: продолжительность соответствующей работы, связывающей события с шифрами А и В (дни)</td>
                    </tr>
                </table>
            </div>
        </div>
        <div style={{minHeight:"100px"}}></div>
    </div>
    )
}

export default Lab2