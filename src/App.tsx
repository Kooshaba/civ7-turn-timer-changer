import { useState, useRef, useEffect } from 'react'
import './App.css'

function App() {
  const [file, setFile] = useState<File | null>(null)
  const [currentTimer, setCurrentTimer] = useState<number | null>(null)
  const [newTimer, setNewTimer] = useState<number>(60)
  const [isProcessing, setIsProcessing] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [success, setSuccess] = useState<string | null>(null)
  const [gameSpeed, setGameSpeed] = useState<string>("QUICK")
  const fileInputRef = useRef<HTMLInputElement>(null)

  // Constants from the original script
  const OFFSET_FROM_MARKER_END = 21  // New constant for offset from end of marker
  const getMarkerString = () => {
    return `LOC_GAMESPEED_${gameSpeed}_NAME`
  }

  // Effect to reset analysis when game speed changes
  useEffect(() => {
    if (file) {
      setCurrentTimer(null)
      analyzeFile(file)
    }
  }, [gameSpeed])

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setError(null)
    setSuccess(null)
    setCurrentTimer(null)
    
    const selectedFile = e.target.files?.[0]
    if (!selectedFile) return
    
    setFile(selectedFile)
    analyzeFile(selectedFile)
  }

  const analyzeFile = async (selectedFile: File) => {
    setIsProcessing(true)
    try {
      const buffer = await selectedFile.arrayBuffer()
      const uint8Array = new Uint8Array(buffer)
      
      // Find the second occurrence of the marker string
      const markerString = getMarkerString()
      const markerBytes = new TextEncoder().encode(markerString)
      let markerOffset = -1
      let occurrenceCount = 0
      
      for (let i = 0; i < uint8Array.length - markerBytes.length; i++) {
        let found = true
        for (let j = 0; j < markerBytes.length; j++) {
          if (uint8Array[i + j] !== markerBytes[j]) {
            found = false
            break
          }
        }
        
        if (found) {
          occurrenceCount++
          if (occurrenceCount === 2) {
            markerOffset = i
            break
          }
        }
      }
      
      if (markerOffset === -1) {
        throw new Error(`Could not find the second occurrence of the marker string "${markerString}" in the file.`)
      }
      
      // Calculate timer offset and read the timer value
      const markerLength = markerString.length
      const timerOffset = markerOffset + markerLength + OFFSET_FROM_MARKER_END
      
      // Read 4 bytes as little-endian unsigned int
      const timerValue = uint8Array[timerOffset] + 
                         (uint8Array[timerOffset + 1] << 8) + 
                         (uint8Array[timerOffset + 2] << 16) + 
                         (uint8Array[timerOffset + 3] << 24)
      
      setCurrentTimer(timerValue)
      setNewTimer(timerValue) // Initialize new timer with current value
    } catch (err) {
      setError(err instanceof Error ? err.message : "An unknown error occurred")
    } finally {
      setIsProcessing(false)
    }
  }

  const handleSave = async () => {
    if (!file || currentTimer === null) return
    
    setIsProcessing(true)
    setError(null)
    setSuccess(null)
    
    try {
      const buffer = await file.arrayBuffer()
      const uint8Array = new Uint8Array(buffer)
      
      // Find the second occurrence of the marker string
      const markerString = getMarkerString()
      const markerBytes = new TextEncoder().encode(markerString)
      let markerOffset = -1
      let occurrenceCount = 0
      
      for (let i = 0; i < uint8Array.length - markerBytes.length; i++) {
        let found = true
        for (let j = 0; j < markerBytes.length; j++) {
          if (uint8Array[i + j] !== markerBytes[j]) {
            found = false
            break
          }
        }
        
        if (found) {
          occurrenceCount++
          if (occurrenceCount === 2) {
            markerOffset = i
            break
          }
        }
      }
      
      if (markerOffset === -1) {
        throw new Error(`Could not find the second occurrence of the marker string "${markerString}" in the file.`)
      }
      
      // Calculate timer offset
      const markerLength = markerString.length
      const timerOffset = markerOffset + markerLength + OFFSET_FROM_MARKER_END
      
      // Write new timer value as little-endian unsigned int
      uint8Array[timerOffset] = newTimer & 0xFF
      uint8Array[timerOffset + 1] = (newTimer >> 8) & 0xFF
      uint8Array[timerOffset + 2] = (newTimer >> 16) & 0xFF
      uint8Array[timerOffset + 3] = (newTimer >> 24) & 0xFF
      
      // Create a new file with the modified data
      const modifiedFile = new File([uint8Array], file.name, { type: file.type })
      
      // Create a download link
      const url = URL.createObjectURL(modifiedFile)
      const a = document.createElement('a')
      a.href = url
      a.download = `modified_${file.name}`
      document.body.appendChild(a)
      a.click()
      
      // Clean up
      URL.revokeObjectURL(url)
      document.body.removeChild(a)
      
      setSuccess(`Successfully updated turn timer to ${newTimer} seconds. File downloaded.`)
    } catch (err) {
      setError(err instanceof Error ? err.message : "An unknown error occurred")
    } finally {
      setIsProcessing(false)
    }
  }

  const resetForm = () => {
    setFile(null)
    setCurrentTimer(null)
    setNewTimer(60)
    setError(null)
    setSuccess(null)
    if (fileInputRef.current) {
      fileInputRef.current.value = ''
    }
  }

  return (
    <div className="app">
      <header className="header">
        <h1>Civilization 7 Turn Timer Utility</h1>
      </header>
      
      <div className="container">
        <div className="card">
          <h2>Upload Save File</h2>
          <p>Select a Civilization 7 save file to modify the turn timer.</p>
          
          <div style={{ marginBottom: '1rem' }}>
            <label htmlFor="gameSpeed" style={{ marginRight: '0.5rem' }}>Game Speed:</label>
            <select 
              id="gameSpeed" 
              value={gameSpeed} 
              onChange={(e) => setGameSpeed(e.target.value)}
              disabled={isProcessing}
            >
              <option value="ONLINE">Online</option>
              <option value="QUICK">Quick</option>
              <option value="STANDARD">Standard</option>
              <option value="EPIC">Epic</option>
              <option value="MARATHON">Marathon</option>
            </select>
          </div>
          
          <input 
            type="file" 
            onChange={handleFileChange} 
            ref={fileInputRef}
            disabled={isProcessing}
          />
          
          {isProcessing && <p>Processing file...</p>}
          
          {error && <div className="error-message">{error}</div>}
          {success && <div className="success-message">{success}</div>}
        </div>
        
        {currentTimer !== null && (
          <div className="card">
            <h2>Turn Timer Settings</h2>
            
            <div className="info-box">
              <p><strong>Current Turn Timer:</strong> {currentTimer} seconds</p>
              <p><strong>Game Speed:</strong> {gameSpeed.toLowerCase()}</p>
            </div>
            
            <div>
              <label htmlFor="newTimer">New Turn Timer (seconds):</label>
              <input 
                type="number" 
                id="newTimer"
                value={newTimer} 
                onChange={(e) => setNewTimer(parseInt(e.target.value) || 0)}
                min="0"
                disabled={isProcessing}
              />
            </div>
            
            <div style={{ marginTop: '1rem', display: 'flex', gap: '0.5rem' }}>
              <button 
                onClick={handleSave}
                disabled={isProcessing || newTimer === currentTimer}
              >
                Save Changes & Download
              </button>
              
              <button 
                onClick={resetForm}
                disabled={isProcessing}
                style={{ backgroundColor: '#f44336' }}
              >
                Reset
              </button>
            </div>
          </div>
        )}
        
        <div className="card">
          <h2>Save Files Found at:</h2>
          <p>C:\Users\YOUR_USERNAME\Documents\My Games\Sid Meier's Civilization VII\Saves\Multi</p>
          <p><strong>Note:</strong> This will create a new file with the modified timer, no need to make a backup.</p>
        </div>
      </div>
      
      <footer className="footer">
        <p>Civilization 7 Turn Timer Utility &copy; {new Date().getFullYear()}</p>
        <p>This tool is not affiliated with or endorsed by 2K Games or Firaxis Games.</p>
      </footer>
    </div>
  )
}

export default App 