import _ from "lodash"
import React, {useEffect, useState, useRef} from "react"

const Lab3 = (args) => {
    const [showErrorMsg, setShowErrorMessage] = useState(false)
    const [showWorksList, setShowWorksList] = useState(false)
    const [givenRows, setGivenRows] = useState(null)
    const [eventsRows, setEventsRows] = useState(null)
    const [jobsRows, setJobsRows] = useState(null)

    useEffect(() => {
        let initData = args.initData
        if (initData == null) {        
            setShowErrorMessage(true)
        } else {
            setShowErrorMessage(false)
            //TODO: Разбить на "Двойную таблицу"
            setGivenRows(initData.orderedInput.map((row) => {
                return(<tr><td>{row[0]}</td><td>{row[1]}</td><td>{row[2]}</td></tr>)
            }))
            // Инициализируем конечное событие
            initData.events[initData.endsAt] = []
            // Дополняем объекты событий
            initData.events.forEach((evnt) => {
                evnt["early"] = 0
                evnt["late"] = 10000
                evnt["reserve"] = 0
                return evnt
            }) 

            if (initData.events[-1000]) {
                initData.events[-1000]["early"] = 0
                initData.events[-1000]["late"] = 10000
                initData.events[-1000]["reserve"] = 0
            }

            const forward = (initData, eventIndex) => {
                let works = _.filter(initData.orderedInput, (work) => {return work[0] == eventIndex})
                
                works.forEach((work) => {
                    let time = work[2] + initData.events[work[0]].early
                    if (time > initData.events[work[1]].early) {
                        initData.events[work[1]].early = time
                    }
                })

                works.forEach((work) => {
                    forward(initData, work[1])
                })
            }
            forward(initData, initData.beginsAt)    // Вроде работает
            
            initData.events[initData.endsAt].late = initData.events[initData.endsAt].early
            const backward = (initData, eventIndex) => {
                let works = _.filter(initData.orderedInput, (work) => {return work[1] == eventIndex})
                
                works.forEach((work) => {
                    let time = initData.events[work[1]].late - work[2]
                    if (time < initData.events[work[0]].late) {
                        initData.events[work[0]].late = time
                    }
                })

                works.forEach((work) => {
                    backward(initData, work[0])
                })
            }
            backward(initData, initData.endsAt)     // Вроде тоже

            initData.events.forEach((evnt) => {
                evnt.reserve = evnt.late - evnt.early
                return evnt
            })

            setEventsRows(initData.events.map((evnt, index) => {
                return <tr><td>{index}</td><td>{evnt.early}</td><td>{evnt.late}</td><td>{evnt.reserve}</td></tr>
            }))
            debugger
        }
    }, [args])

    return(

        <div>
            <h3>Лабораторная работа 3</h3>
            <p>Управление проектами. Расчет параметров событий и работ сетевого графика. Определение критического пути</p>
        
            {showErrorMsg && 
                <div>
                    <p style={{color:"red"}}>Необходимо сначала получить результат лабораторной работы 2</p>
                </div>}

            <button onClick={() => setShowWorksList(true)}>Показать список работ</button>
            {showWorksList && 
                <div>
                    <p>Список работ:</p>
                    <table>
                        <tr>
                            <td>A</td>
                            <td>B</td>
                            <td>T<sub>AB</sub></td>
                            <td>A</td>
                            <td>B</td>
                            <td>T<sub>AB</sub></td>
                        </tr>
                        {givenRows}
                    </table>
                </div>}

                <div>
                    <p>Параметры событий СГ</p>
                    <table>
                        <tr>
                            <td rowSpan="2">Событие</td>
                            <td colSpan="2">Сроки совершения событий</td>
                            <td rowSpan="2">Резерв времени события</td>
                        </tr>
                        <tr>
                            <td>Ранний</td>
                            <td>Поздний</td>
                        </tr>
                        {eventsRows}
                    </table>
                </div>
                <div>
                    <p>Параметры работ СГ</p>
                    <table>
                        <tr>
                            <td rowSpan="2">Работа</td>
                            <td rowSpan="2">Продолжительность работы</td>
                            <td colSpan="2">Резерв времени события</td>
                        </tr>
                        <tr>
                            <td>Полный</td>
                            <td>Независимый</td>
                        </tr>
                        {jobsRows}
                    </table>
                </div>
                <div>
                    <p>Список работ всех кртитческих путей СГ</p>
                    <p>Длина критического пути</p>
                </div>
        </div>
    )
}

export default Lab3