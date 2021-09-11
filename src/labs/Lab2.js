import React, {useEffect, useState, useRef} from "react"
var _ = require("lodash")

const Lab2 = () => {
    const [givenTableRows, setGivenTableRows] = useState(null)
    const [givenData, setGivenData] = useState(null)
    
    const [myLog, setLog] = useState("")
    const [fullPaths, setFullPaths] = useState([])

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
        
            let from = [], to = [], events = []     // events - события с исходящими работами
            givenData.forEach((row) => {
                // Сразу удаляем "петельные" работы
                if (row[0] === row[1]) {
                    setLog(prevState => prevState + `Ошибка! Дуга ${row[0]}-${row[1]} удалена\n`)
                    return
                }
                // Если исходной вершины ещё не было, инициализируем контейнер и сохраняем исходную точку
                if (_.findIndex(from, (elem) => { return elem === row[0]}) === -1){
                    from.push(row[0])
                    events[row[0]] = []
                }

                events[row[0]].push(row)

                // Смотрим, фиксировали ли уже "пункт назначения"
                if (_.indexOf(to, row[1])){
                    to.push(row[1])
                }
            })

            // Назодим начальные и конечные точки
            let starts = _.difference(from, to)
            let ends = _.difference(to, from)
            // TODO: сделать обработки
            if (starts.length !== 1) {
                setLog(myLog + `Не одно начальное событие.\n`)
            }
            if (ends.length !== 1) {
                setLog(myLog + `Не одно конечное событие.\n`)
            }

            // Делаем dfs для поиска полных путей
            let paths = []
            starts.forEach((start) => {
                let path = [start]
                const search = (path, paths) => {
                    let currentEvent = events[path.slice(-1)]
                    currentEvent.forEach((work) => {
                        // Предотвращение циклов
                        if (_.indexOf(path, work[1]) !== -1) {
                            setLog(myLog + `Найден цикл ${path} -> ${work[1]}. Пропускаем вершину. Рекомендуем удалить работу ${work}\n`)
                            return
                        }
                        path.push(work[1])              // Добавляем в путь следующую точку из текушего события
                        if (!events[work[1]]) {         // Если эта точка без события - полный путь найден
                            paths.push(JSON.parse(JSON.stringify(path)))    // Сохраняем найденный путь
                        } else {                        // Если событие есть - делаем шаг рекурсии
                            search(path, paths)
                        }
                        path.pop()
                    })
                }
                let currPaths = []
                search(path, currPaths)
                paths = paths.concat(currPaths)
            })
            let fullPathsString = ""
            paths.forEach((path, index) => {
                fullPathsString += JSON.stringify(path).replaceAll(",", "->").replace("[", `${index + 1})`).replace("]", "<br />")
            })
            setFullPaths(fullPathsString)
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
        <div style={{display:"flex", maxHeight:"250px"}}>
            <div style={{flex:"1"}}>
                <p>Лог операций:</p>
                <p>{myLog}</p>
            </div>
            <div style={{flex:"1", overflow:"scroll"}}>
                <p>Список полных путей:</p>
                <div>{fullPaths}</div>
            </div>
        </div>
        <div style={{minHeight:"100px"}}></div>
    </div>
    )
}

export default Lab2