import { useCallback, useEffect, useRef, useState } from 'react';
import './App.css';

const symbols: Record<string, string> = {
  'addition': '+',
  'subtraction': '-',
  'multiplication': '*',
  'division': '/'
}

const symbolFunctions: Record<string, (a: number, b: number) => number> = {
  '+': (a: number, b: number) => {return a + b},
  '-': (a: number, b: number) => {return a - b},
  '*': (a: number, b: number) => {return a * b},
  '/': (a: number, b: number) => {return a / b}
}

function getRandomNumber(min: number, max: number) {
  return Math.floor(Math.random() * (max - min + 1)) + min
}

function equationToString(numbers: number[], operations: string[]): string {
  let s = String(numbers[0] < 0 ? "(" + numbers[0] + ")" : numbers[0])
  for (let i = 0; i < numbers.length-1; i++) {
    const n = numbers[i+1] < 0 ? "(" + numbers[i+1] + ")" : numbers[i+1]
    s += (" " + operations[i] + " " + n)
  }
  return s
}

function App() {
  const [operationCount, setOperationCount] = useState(2);
  const [interval, setIntervalNumber] = useState(1);
  const [operationsToUse, setOperationsToUse] = useState<Set<string>>(new Set(["+"]));
  const [numberFrom, setNumberFrom] = useState(1);
  const [numberTo, setNumberTo] = useState(100);
  const inputRef: any = useRef(null)

  const [currentNumber, setCurrentNumber] = useState<number | null>(null);
   const [currentOperation, setCurrentOperation] = useState("");

  const operationCountChanged = (event: any) => setOperationCount(+event.target.value);
  const intervalChanged = (event: any) => setIntervalNumber(+event.target.value);
  const numberFromChanged = (event: any) => setNumberFrom(+event.target.value);
  const numberToChanged = (event: any) => setNumberTo(+event.target.value);
  const operationsToUseChanged = (event: any) => {
    setOperationsToUse((prev: Set<string>) => {
      const newOperationsToUse = new Set(prev)
      if (event.target.checked) {
        newOperationsToUse.add(symbols[event.target.value]);
      } else {
        newOperationsToUse.delete(symbols[event.target.value]);
      }
      console.log(newOperationsToUse)
      return newOperationsToUse
    })
  }

  const [inSession, setInSession] = useState(false);
  const [finishedSession, setFinishedSession] = useState(false);
  const [answering, setAnswering] = useState(false);

  const [userAnswer, setUserAnswer] = useState<number | null>(null)
  const [numberArray, setNumberArray] = useState<number[]>([])
  const [operationArray, setOperationArray] = useState<string[]>([])

  const resetStates = () => {
    setCurrentNumber(null);
    setCurrentOperation("");
    setInSession(false)
    setFinishedSession(false);
    setAnswering(false);
    setUserAnswer(null);
    setNumberArray([]);
    setOperationArray([]);
  }

  const startSession = (event: any) => {
    if (event !== null) event.preventDefault();
    if (operationsToUse.size === 0) return;
  
    const operations = [...operationsToUse]

    let operationSession: number
    let totalTime = interval * operationCount
    
    resetStates();
    setInSession(true);
    
    const firstNumber = getRandomNumber(numberFrom, numberTo);
    const numbers = [firstNumber]
    const operators: string[] = []

    const visibilityTime = (1000 * interval) * 0.9

    setCurrentNumber(firstNumber);
    setTimeout(() => {setCurrentNumber(null); setCurrentOperation("")}, visibilityTime)

    operationSession = setInterval(() => {
      totalTime -= interval
      if (totalTime <= 0) {

        setOperationArray(operators)
        setNumberArray(numbers)
        setAnswering(true);
        setFinishedSession(true);

        clearInterval(operationSession);
      } else {
        const num = getRandomNumber(numberFrom, numberTo)
        const opIdx = getRandomNumber(0, operations.length-1)

        setCurrentNumber(num);
        setCurrentOperation(operations[opIdx]);

        setTimeout(() => {setCurrentNumber(null); setCurrentOperation("")}, visibilityTime)

        numbers.push(num);
        operators.push(operations[opIdx]);
      }
    }, 1000 * interval) 
  }

  const getAnswer = () => {
    let answer = numberArray[0]
    for (let i = 0; i < numberArray.length-1; i++) {
      answer = symbolFunctions[operationArray[i]](answer, numberArray[i+1])
    }
    return answer
  }

  useEffect(() => {
    inputRef.current?.focus()
  }, [finishedSession]);

  useEffect(() => {
    const handleKeyDown = (event: any) => {
      // if (event.defaultPrevented) return;

      switch (event.key) {
        case "Enter":
          if ((document.activeElement as any).tagName !== 'BUTTON') {
            if (answering) setAnswering(false);
            else if (finishedSession) startSession(null);
          }
          break;
        default:
          return;
      }

      // event.preventDefault();
    }

    window.addEventListener('keydown', handleKeyDown);
    return () => {
      window.removeEventListener('keydown', handleKeyDown);
    }
  }, [answering, finishedSession])

  return !inSession ? (
    <div className='centered'>
      <h1>Flash Anzan</h1>
      <form onSubmit={startSession}>
        <div>
          <label htmlFor='operation-count'>Number of operations: </label> <br/>
          <input type='range' name='operation-count' id='operation-count' min='2' max='50' defaultValue={operationCount} onChange={operationCountChanged}/>
          <span> {operationCount}</span>
        </div>

        <div>
          <label htmlFor='interval'>Interval: </label> <br/>
          <input type='range' name='interval' id='interval' min='0.1' max='10' step='0.1' defaultValue={interval} onChange={intervalChanged}/>
          <span> {interval} second/s</span>
        </div>

        <div>
          <label htmlFor='number-from'>From: </label> <br/>
          <input type='number' name='number-from' id='number-from' defaultValue={numberFrom} step='any' onChange={numberFromChanged}/>
        </div>

        <div>
          <label htmlFor='number-to'> To: </label> <br/>
          <input type='number' name='number-to' id='number-to' defaultValue={numberTo} step='any' onChange={numberToChanged}/>
        </div>

        <div>
          <p>Operations:</p>
          <input type='checkbox' name='operations' id='addition' value='addition' onChange={operationsToUseChanged} defaultChecked={operationsToUse.has('+')}/>
          <label htmlFor='addition'>Addition</label>
          
          <br/>
          <input type='checkbox' name='operations' id='subtraction' value='subtraction' onChange={operationsToUseChanged} defaultChecked={operationsToUse.has('-')}/>
          <label htmlFor='subtraction'>Subtraction</label>

          <br/>
          <input type='checkbox' name='operations' id='multiplication' value='multiplication' onChange={operationsToUseChanged} defaultChecked={operationsToUse.has('*')}/>
          <label htmlFor='multiplication'>Multiplication</label>

          <br/>
          <input type='checkbox' name='operations' id='division' value='division' onChange={operationsToUseChanged} defaultChecked={operationsToUse.has('/')}/>
          <label htmlFor='division'>Division</label>
        </div>

        <button type='submit' name="submit-button" id="submit-button">Start</button>
      </form>
    </div>
  ):(
    !finishedSession ? (
      <>
        <div className="centered">
          <div className='number-grid'>
            <p className="number">{currentOperation}</p>
            <p className="number">{currentNumber}</p>
            <p></p>
          </div>
        </div>
      </>
    ) : (
      <>
        <div className="centered">
          <p>Answer:</p>
          <input ref={inputRef} type='number' disabled={!answering} onChange={(event: any) => setUserAnswer(event.target.value)}/>

          {answering && <button onClick={() => {setAnswering(false)}}>Submit</button>}
          {!answering && (
            <>
              <p>{userAnswer !== null && getAnswer() === +userAnswer ? "CORRECT" : "WRONG"}</p>
              <p>Answer: {getAnswer()}</p>
              <p>Equation: {equationToString(numberArray, operationArray)}</p>
              <button onClick={startSession}>Try again</button>
              <button onClick={resetStates}>Back</button>
            </>
          )}
        </div>
      </>
    )
  )
}

export default App;
