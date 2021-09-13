import React, {useEffect, useState, useRef} from "react"
var _ = require("lodash")

const Lab2 = () => {
    const [givenTableRows, setGivenTableRows] = useState(null)
    const [givenData, setGivenData] = useState(null)
    const [sortedTableRows, setSortedTableRows] = useState(null)
    
    const [myLog, setLog] = useState([])
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
        let logupdate = []
        if (givenData) {
            setGivenTableRows(givenData.map((row) => {
                return(<tr><td>{row[0]}</td><td>{row[1]}</td><td>{row[2]}</td></tr>)
            }))
        
            let from = [], to = [], events = []     // events - события с исходящими работами
            givenData.forEach((row) => {
                // Сразу удаляем "петельные" работы
                if (row[0] === row[1]) {
                    logupdate.push(`Ошибка! Дуга ${row[0]}-${row[1]} удалена\n`)
                    return
                }
                // Если исходной вершины ещё не было, инициализируем контейнер и сохраняем исходную точку
                if (_.indexOf(from,row[0]) === -1) {
                    from.push(row[0])
                    events[row[0]] = []
                }
                // Ищем повторы дуг
                if (_.findIndex(events[row[0]], elem => { return elem[1] === row[1]}) !== -1) {
                    logupdate.push(`Повтор дуги ${JSON.stringify(row)}. Выберете необходимую работу и отредактируйте таблицу`)
                }

                events[row[0]].push(row)

                // Смотрим, фиксировали ли уже "пункт назначения"
                if (_.indexOf(to, row[1]) === -1){
                    to.push(row[1])
                }
            })

            // Назодим начальные и конечные точки
            let starts = _.difference(from, to)
            let ends = _.difference(to, from)
            if (starts.length !== 1) {
                logupdate.push(`Не одно начальное событие. Добавлено искусственное событие '-1000'.\nПри необходимости отредактируйте входную таблицу\n`)
                events[-1000] = starts.map(startPoint => { return [-1000, startPoint, 0] })
            }
            if (ends.length !== 1) {
                logupdate.push(`Не одно конечное событие. Добавлено искусственное событие '1000'.\nПри необходимости отредактируйте входную таблицу\n`)
                ends.forEach(end => { events[end] = [[end, 1000, 0]] })
            }

            // Делаем dfs для поиска полных путей
            let paths = []
            let worksToDelete = []
            starts.forEach((start) => {
                let path = [start]
                const search = (path, paths) => {
                    let currentEvent = events[path.slice(-1)]
                    currentEvent.forEach((work) => {
                        // Предотвращение циклов
                        if (_.indexOf(path, work[1]) !== -1) {
                            logupdate.push(`Найден цикл ${JSON.stringify(path)} -> ${work[1]}. Пропускаем вершину. Убедитесь в правильности работы ${JSON.stringify(work)}\n`)
                            let alreadymentioned = _.find(worksToDelete, {targetEvent: path.slice(-1)[0], work: work})

                            if (!alreadymentioned) {
                                worksToDelete.push({targetEvent: path.slice(-1)[0], work: work, count: 1})
                            } else {
                                alreadymentioned.count++
                            }
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
            setFullPaths(paths.map((path, index) => {
                return <p style={{margin:"5px"}}>{JSON.stringify(path).replaceAll(",", "->").replace("[", `${index + 1})`).replace("]", "")}</p>
            }))
            setLog(logupdate.map((msg, index) => {
                return <p>{index + 1}: {msg}</p>
            }))
            let sortedArray = []
            
            let eventsOrder = JSON.parse(JSON.stringify(starts))
            

            setSortedTableRows(_.sortBy(givenData, (elem) => {return elem}).map((row) => {
                return(<tr><td>{row[0]}</td><td>{row[1]}</td><td>{row[2]}</td></tr>)
            }))
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
                    {/* <tr>
                        <td colSpan="3" height="40px">
                            <form >
                                <input type="text" name="first" placeholder="A"/>
                                <input type="text" name="second" placeholder="B"/>
                                <input type="text" name="time" placeholder="T"/>
                                <input type="submit" value="Добавить в таблицу" />
                            </form>
                        </td>   
                    </tr> */}
                    {givenTableRows}
                </table>
            </div>
            <div style={{flex: 1, paddingLeft:"30px"}}>
                <h4>Упорядоченный список работ</h4>
                <table>
                    <tr>
                        <td><b>A</b></td>
                        <td><b>B</b></td>
                        <td><b>T<sub>AB</sub></b></td>
                    </tr>
                    {sortedTableRows}
                </table>
            </div>
        </div>
        <div style={{display:"flex"}}>
            <div style={{flex:"1", textAlign:"left", lineHeight:"15px"}}>
                <p>Лог операций:</p>
                <div style={{overflow:"scroll", height:"300px", overflowX:"hidden", overflowY:"auto"}}>
                    {myLog}
                </div>
            </div>
            <div style={{flex:"1", textAlign:"left", lineHeight:"15px"}}>
                <p>Список полных путей (всего - {fullPaths.length}):</p>
                <div style={{overflow:"scroll", height:"300px", overflowX:"hidden"}}>
                    {fullPaths}
                </div>
            </div>
        </div>
        <div style={{minHeight:"100px"}}></div>
    </div>
    )
}

export default Lab2