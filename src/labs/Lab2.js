import React, {useEffect, useState, useRef} from "react"
var _ = require("lodash")

const Lab2 = (args) => {
    const [minimizedTableRows, setminimizedTableRows] = useState(null)
    const [givenData, setGivenData] = useState(null)
    const [analysisResults, setAnalysisResults] = useState([])
    
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

    const deleteRow = (rowIndex) => {
        let medium = JSON.parse(JSON.stringify(givenData))
        medium.splice(rowIndex, 1)
        setGivenData(medium)
        setminimizedTableRows(givenData.map((row) => {
            return(<tr><td>{row[0]}</td><td>{row[1]}</td><td>{row[2]}</td></tr>)
        }))
    }

    useEffect(() => {
        setAnalysisResults([])          // Ре-инициализируем state каждый рендер, чтобы не дублировались сообщения
        let logupdate = []
        if (givenData) {
            // Выводим "дано"
            setminimizedTableRows(givenData.map((row) => {
                return(<tr><td>{row[0]}</td><td>{row[1]}</td><td>{row[2]}</td></tr>)
            }))
        
            //          НАЧИНАЕМ АНАЛИЗ ТАБЛИЦЫ
            let from = [], to = [], events = []     // events - события с исходящими работами
            let needToBreak = false
            givenData.every((row, rowIndex) => {
                // Удаляем "петельные" работы
                if (row[0] === row[1]) {
                    setAnalysisResults(
                    <div style={{border:"1px solid black", lineHeight:"10px", marginBottom:"10px"}}>
                        <p>Обнаружена прямая петля {`${row[0]}-${row[1]} ${row[2]}`}.</p>
                        <button onClick={() => deleteRow(rowIndex)}>Удалить петлю</button>
                    </div>)
                    needToBreak = true
                    return false
                }
                // Если исходной вершины ещё не было, инициализируем контейнер и сохраняем исходную точку
                if (_.indexOf(from,row[0]) === -1) {
                    from.push(row[0])
                    events[row[0]] = []
                }
                // Ищем повторы дуг
                let repeatIndex = _.findIndex(events[row[0]], elem => { return elem[1] === row[1]})
                if (repeatIndex !== -1) {
                    let indexInData = _.findIndex(givenData, (iterRow) => {
                        return (iterRow[0] == row[0]) && (iterRow[1] == row[1])
                    })
                    
                    setAnalysisResults(
                    <div style={{border:"1px solid black", lineHeight:"10px", marginBottom:"10px"}}>
                        <p>Работа {row[0]}-{row[1]} дублируется.</p>
                        <p>Вес 1: {events[row[0]][repeatIndex][2]}, вес 2: {row[2]}</p>
                        <span>
                            <button onClick={() => deleteRow(indexInData)}>Удалить вес 1</button>
                            <button onClick={() => deleteRow(rowIndex)}>Удалить вес 2</button>
                        </span>
                    </div>)
                    needToBreak = true
                    return false
                }

                events[row[0]].push(row)

                // Смотрим, фиксировали ли уже "пункт назначения"
                if (_.indexOf(to, row[1]) === -1){
                    to.push(row[1])
                }
                return true
            })
            if (needToBreak) {
                return
            }
            // Находим начальные и конечные точки
            let starts = _.difference(from, to)
            let ends = _.difference(to, from)

            // по сути хуки
            const deleteEvent = (eventIndex) => {
                let medium = JSON.parse(JSON.stringify(givenData))
                setGivenData(_.filter(medium, (elem) => {return elem[0] != eventIndex}))
            }
            
            // Если не одно начало
            if (starts.length !== 1) {
                let worksToDelete = starts.map((work) => {
                    return <button onClick={() => deleteEvent(work)}>Удалить событие {work}</button>
                })
                const addFictionalStart = (eventIndex, departures) => {
                    let medium = JSON.parse(JSON.stringify(givenData))
                    medium = [...departures.map((dep) => {return [eventIndex, dep, 0]}), ...medium]
                    setGivenData(medium)
                }
                setAnalysisResults(
                    <div style={{border:"1px solid black", lineHeight:"10px", marginBottom:"10px"}}>
                        <p>Не одно начальное событие!</p>
                        <button onClick={() => addFictionalStart(-1000, starts)}>Добавить фиктивное событие "-1000"</button>
                        {worksToDelete}
                    </div>
                )
                return
            }
            // Если не один конец
            if (ends.length !== 1) {
                let worksToDelete = ends.map((work) => {
                    return <button onClick={() => deleteEvent(work)}>Удалить событие {work}</button>
                })
                const addFictionalEnd = (eventIndex, destinations) => {
                    let medium = JSON.parse(JSON.stringify(givenData))
                    medium = [...medium, ...destinations.map((dest) => {return [dest, eventIndex, 0]})]
                    setGivenData(medium)
                }
                setAnalysisResults(
                    <div style={{border:"1px solid black", lineHeight:"10px", marginBottom:"10px"}}>
                        <p>Не одно конечное событие!</p>
                        <button onClick={() => addFictionalEnd(1000, ends)}>Добавить фиктивное событие "1000"</button>
                        {worksToDelete}
                    </div>
                )
                return
            }

            // Делаем dfs для поиска полных путей
            let paths = []
            let worksToDelete = []

            starts.every((start) => {
                let path = [start]
                needToBreak = false                     // флаг с сигналом о том, что нужно прекратить дальнейшие поиски
                const search = (path, paths) => {
                    let currentEvent = events[path.slice(-1)]
                    currentEvent.every((work) => {
                        // Предотвращение циклов
                        if (_.indexOf(path, work[1]) !== -1) {
                            setAnalysisResults(
                                <div style={{border:"1px solid black", lineHeight:"10px", marginBottom:"10px"}}>
                                    <p>{`Обнаружен цикл ${JSON.stringify(path).replaceAll(",","=>")} ==> ${work[1]}!`}</p>
                                    <button onClick={() => deleteRow(_.findIndex(givenData, (row) => {return _.isEqual(row, work)}))}>
                                        {`Удалить работу ${JSON.stringify(work)}`}
                                    </button>
                                </div>
                            )
                            needToBreak = true
                            return false
                            logupdate.push(`Найден цикл ${JSON.stringify(path)} -> ${work[1]}. Необходимо отредактироавть работу ${JSON.stringify(work)}\n`)
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
                        return true
                    })
                }

                let currPaths = []
                search(path, currPaths)
                paths = paths.concat(currPaths)
                return true
            })
            
            if (needToBreak) {
                return
            }

            setFullPaths(paths.map((path, index) => {
                return <p style={{margin:"5px"}}>{JSON.stringify(path).replaceAll(",", "->").replace("[", `${index + 1})`).replace("]", "")}</p>
            }))
        
            let eventsOrder = JSON.parse(JSON.stringify(starts))
            let orderedRows = []
            let processedEvents = []
            
            while (events[eventsOrder[0]]) {
                let nextEvents = []
                eventsOrder.forEach(currEvent => {
                    (events[currEvent] || []).forEach(work => {
                        orderedRows.push(work)
                        if (_.indexOf(processedEvents, work[1]) === -1 && _.indexOf(nextEvents, work[1]) === -1) {
                            nextEvents.push(work[1])
                        }
                    })
                })
                eventsOrder = nextEvents
                processedEvents = [...processedEvents, ...eventsOrder]
            }
            // Выставляем результат упорядочивания
            setAnalysisResults(
                <div>
                    <p>Частично упорядоченный список работ</p>
                    <table>
                        <tr>
                            <td>A</td><td>B</td><td>T<sub>AB</sub></td>
                        </tr>
                        {orderedRows.map((row) => {
                            return(<tr><td>{row[0]}</td><td>{row[1]}</td><td>{row[2]}</td></tr>)
                        })}
                    </table>
                </div>
            )
            
            args.setResult({
                "orderedInput": orderedRows,
                "fullPaths": paths,
                "events": events,
                "beginsAt": starts[0],
                "endsAt": ends[0]
            })
        }
    }, [givenData])

    return(
    <div>
        <h3>Лабораторная работа 2</h3>
        <p>Управление проектами. Упорядочение исходного списка работ сетевого графика</p>

        <div style={{display: "flex", maxWidth:"1200px"}}>
            <div style={{flex: 1}}>
                <h4>Упорядоченный список работ</h4>
                <table>
                    <tr>
                        <td><b>A</b>: шифр предшествующего события</td>
                        <td><b>B</b>: шифр последующего события</td>
                        <td><b>T<sub>AB</sub></b>: продолжительность соответствующей работы, связывающей события с шифрами А и В (дни)</td>
                    </tr>
                    {minimizedTableRows}
                </table>
            </div>
            <div style={{flex: 1, paddingLeft:"30px"}}>
                <h4>Упорядочение работ</h4>
                {analysisResults}
            </div>
        </div>
        <div style={{display:"flex"}}>
            <div style={{flex:"1", textAlign:"left", lineHeight:"15px"}}>
                
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