import React, { useState, useRef, useEffect } from 'react';
import { Play, Server, Code, Terminal, Info, ArrowRight, CheckCircle2, AlertCircle } from 'lucide-react';

// Dữ liệu mô phỏng ban đầu cho Database
const initialUsers = [
  { id: 1, name: "Nguyễn Văn A", role: "Admin" },
  { id: 2, name: "Trần Thị B", role: "User" }
];

export default function App() {
  const [users, setUsers] = useState(initialUsers);
  const [method, setMethod] = useState('GET');
  const [url, setUrl] = useState('/api/users');
  const [reqBody, setReqBody] = useState('{\n  "name": "Lê Văn C",\n  "role": "User"\n}');
  
  const [response, setResponse] = useState(null);
  const [logs, setLogs] = useState([]);
  const [activeHandler, setActiveHandler] = useState('main');
  const [isProcessing, setIsProcessing] = useState(false);

  const logsEndRef = useRef(null);

  // Cuộn xuống cuối log khi có log mới
  useEffect(() => {
    logsEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [logs]);

  const addLog = (message, type = 'info') => {
    setLogs(prev => [...prev, { time: new Date().toLocaleTimeString(), message, type }]);
  };

  // Hàm mô phỏng router của Go 1.22
  const handleSendRequest = () => {
    setIsProcessing(true);
    setResponse(null);
    setActiveHandler('main');
    addLog(`Đang nhận request: ${method} ${url}...`, 'info');

    setTimeout(() => {
      // Bắt đầu định tuyến (Routing)
      if (url === '/api/users' && method === 'GET') {
        setActiveHandler('getUsers');
        addLog(`Router khớp với "GET /api/users". Gọi hàm getUsers(w, r)`, 'success');
        
        setTimeout(() => {
          addLog(`Thiết lập Header: Content-Type = application/json`, 'info');
          addLog(`Encode mảng users thành JSON và ghi vào ResponseWriter`, 'info');
          setResponse({ status: 200, body: users });
          setIsProcessing(false);
          setActiveHandler('main');
        }, 800);

      } else if (url === '/api/users' && method === 'POST') {
        setActiveHandler('createUser');
        addLog(`Router khớp với "POST /api/users". Gọi hàm createUser(w, r)`, 'success');
        
        setTimeout(() => {
          try {
            const parsedBody = JSON.parse(reqBody);
            if (!parsedBody.name) throw new Error("Thiếu trường name");
            
            addLog(`Decode JSON từ Request Body: ${JSON.stringify(parsedBody)}`, 'info');
            
            const newUser = { id: users.length > 0 ? Math.max(...users.map(u => u.id)) + 1 : 1, ...parsedBody };
            setUsers(prev => [...prev, newUser]);
            
            addLog(`Đã thêm user mới vào Database (id: ${newUser.id})`, 'info');
            addLog(`Ghi status 201 Created và trả về user vừa tạo`, 'success');
            
            setResponse({ status: 201, body: newUser });
          } catch (e) {
            addLog(`Lỗi Decode JSON: ${e.message}`, 'error');
            setResponse({ status: 400, body: { error: "Bad Request: " + e.message } });
          }
          setIsProcessing(false);
          setActiveHandler('main');
        }, 1000);

      } else if (url.startsWith('/api/users/') && method === 'DELETE') {
        const idStr = url.split('/').pop();
        const id = parseInt(idStr);
        setActiveHandler('deleteUser');
        addLog(`Router khớp với "DELETE /api/users/{id}". Gọi hàm deleteUser(w, r)`, 'success');
        
        setTimeout(() => {
          addLog(`Lấy path value "id" = ${idStr}`, 'info');
          
          if (isNaN(id)) {
            addLog(`Lỗi: id không hợp lệ`, 'error');
            setResponse({ status: 400, body: { error: "Invalid ID" } });
          } else {
            const userExists = users.some(u => u.id === id);
            if (userExists) {
              setUsers(prev => prev.filter(u => u.id !== id));
              addLog(`Đã xóa user id ${id} khỏi Database`, 'info');
              setResponse({ status: 204, body: null });
            } else {
              addLog(`Không tìm thấy user id ${id}`, 'error');
              setResponse({ status: 404, body: { error: "User not found" } });
            }
          }
          setIsProcessing(false);
          setActiveHandler('main');
        }, 1000);

      } else {
        addLog(`404 Not Found: Không có route nào khớp với ${method} ${url}`, 'error');
        setResponse({ status: 404, body: { error: "Not Found" } });
        setIsProcessing(false);
      }
    }, 500);
  };

  // Đoạn code Go hiển thị
  const goCodeBlocks = [
    {
      id: 'imports',
      code: `package main

import (
\t"encoding/json"
\t"net/http"
\t"strconv"
)

// Cấu trúc dữ liệu User
type User struct {
\tID   int    \`json:"id"\`
\tName string \`json:"name"\`
\tRole string \`json:"role"\`
}

var users = []User{ /* ... dữ liệu mẫu ... */ }`
    },
    {
      id: 'main',
      code: `func main() {
\t// Tạo Router mới (từ Go 1.22+)
\tmux := http.NewServeMux()

\tmux.HandleFunc("GET /api/users", getUsers)
\tmux.HandleFunc("POST /api/users", createUser)
\tmux.HandleFunc("DELETE /api/users/{id}", deleteUser)

\thttp.ListenAndServe(":8080", mux)
}`
    },
    {
      id: 'getUsers',
      code: `func getUsers(w http.ResponseWriter, r *http.Request) {
\tw.Header().Set("Content-Type", "application/json")
\t// Encode struct thành JSON và gửi về Client
\tjson.NewEncoder(w).Encode(users)
}`
    },
    {
      id: 'createUser',
      code: `func createUser(w http.ResponseWriter, r *http.Request) {
\tvar u User
\t// Đọc body từ Client và chuyển thành struct u
\tif err := json.NewDecoder(r.Body).Decode(&u); err != nil {
\t\thttp.Error(w, err.Error(), http.StatusBadRequest)
\t\treturn
\t}
\t
\tu.ID = generateNewID()
\tusers = append(users, u)

\tw.Header().Set("Content-Type", "application/json")
\tw.WriteHeader(http.StatusCreated) // HTTP 201
\tjson.NewEncoder(w).Encode(u)
}`
    },
    {
      id: 'deleteUser',
      code: `func deleteUser(w http.ResponseWriter, r *http.Request) {
\t// Lấy biến {id} từ URL
\tidStr := r.PathValue("id")
\tid, _ := strconv.Atoi(idStr)

\t// Xóa user khỏi mảng (Mô phỏng logic DB)
\tdeleteUserFromDB(id)

\tw.WriteHeader(http.StatusNoContent) // HTTP 204
}`
    }
  ];

  return (
    <div className="min-h-screen bg-slate-50 text-slate-800 font-sans p-4 md:p-8">
      <header className="max-w-7xl mx-auto mb-8 flex items-center gap-3">
        <Server className="w-8 h-8 text-blue-600" />
        <div>
          <h1 className="text-2xl font-bold text-slate-900">Trình Mô Phỏng Golang HTTP API</h1>
          <p className="text-sm text-slate-500">Hiểu cách Go nhận request, định tuyến (routing) và trả về JSON.</p>
        </div>
      </header>

      <div className="max-w-7xl mx-auto grid grid-cols-1 lg:grid-cols-12 gap-6">
        
        {/* CỘT TRÁI: MÃ NGUỒN GO */}
        <div className="lg:col-span-5 flex flex-col gap-4">
          <div className="bg-slate-900 rounded-xl shadow-lg border border-slate-700 overflow-hidden flex flex-col h-full">
            <div className="bg-slate-800 px-4 py-3 flex items-center gap-2 border-b border-slate-700">
              <Code className="w-5 h-5 text-blue-400" />
              <h2 className="text-sm font-semibold text-slate-200">main.go</h2>
              <span className="ml-auto text-xs bg-blue-500/20 text-blue-300 px-2 py-1 rounded">Go 1.22+</span>
            </div>
            <div className="p-4 overflow-y-auto text-sm font-mono text-slate-300 space-y-2">
              {goCodeBlocks.map(block => (
                <div 
                  key={block.id}
                  className={`p-2 rounded transition-all duration-300 ${
                    activeHandler === block.id 
                      ? 'bg-blue-900/40 border border-blue-500/50 shadow-[0_0_15px_rgba(59,130,246,0.2)]' 
                      : 'border border-transparent'
                  }`}
                >
                  <pre className="whitespace-pre-wrap">{block.code}</pre>
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* CỘT PHẢI: CLIENT & LOGS */}
        <div className="lg:col-span-7 flex flex-col gap-6">
          
          {/* CLIENT GIAO DIỆN GỬI REQUEST */}
          <div className="bg-white rounded-xl shadow-sm border border-slate-200 overflow-hidden">
            <div className="bg-slate-100 px-4 py-3 flex items-center gap-2 border-b border-slate-200">
              <Play className="w-5 h-5 text-green-600" />
              <h2 className="text-sm font-semibold text-slate-800">Gửi HTTP Request (Client)</h2>
            </div>
            <div className="p-4 flex flex-col gap-4">
              
              <div className="flex gap-2">
                <select 
                  className="bg-slate-50 border border-slate-300 rounded-lg px-3 py-2 font-mono text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 font-bold"
                  value={method}
                  onChange={(e) => {
                    setMethod(e.target.value);
                    if (e.target.value === 'GET') setUrl('/api/users');
                    if (e.target.value === 'DELETE') setUrl('/api/users/1');
                  }}
                  disabled={isProcessing}
                >
                  <option className="text-blue-600">GET</option>
                  <option className="text-green-600">POST</option>
                  <option className="text-red-600">DELETE</option>
                </select>
                <input 
                  type="text" 
                  className="flex-1 bg-slate-50 border border-slate-300 rounded-lg px-3 py-2 font-mono text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
                  value={url}
                  onChange={(e) => setUrl(e.target.value)}
                  placeholder="/api/users"
                  disabled={isProcessing}
                />
                <button 
                  onClick={handleSendRequest}
                  disabled={isProcessing}
                  className="bg-blue-600 hover:bg-blue-700 disabled:bg-blue-400 text-white px-6 py-2 rounded-lg font-semibold transition-colors flex items-center gap-2"
                >
                  {isProcessing ? 'Đang gửi...' : 'Gửi'}
                </button>
              </div>

              {method === 'POST' && (
                <div>
                  <label className="block text-xs font-semibold text-slate-500 mb-1 uppercase tracking-wider">Request Body (JSON)</label>
                  <textarea 
                    className="w-full h-32 bg-slate-50 border border-slate-300 rounded-lg p-3 font-mono text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
                    value={reqBody}
                    onChange={(e) => setReqBody(e.target.value)}
                    disabled={isProcessing}
                  />
                </div>
              )}

              {/* Hướng dẫn tương tác */}
              <div className="bg-blue-50 rounded-lg p-3 text-sm text-blue-800 flex gap-2 items-start border border-blue-100">
                <Info className="w-5 h-5 shrink-0 mt-0.5 text-blue-600" />
                <p>
                  <strong>Thử nghiệm:</strong> 
                  <br/>- Chọn <code>GET</code> để lấy danh sách.
                  <br/>- Chọn <code>POST</code> để tạo user mới (sửa tên trong JSON).
                  <br/>- Chọn <code>DELETE</code> và đổi URL thành <code>/api/users/2</code> để xóa user.
                </p>
              </div>
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6 h-full min-h-[300px]">
            {/* SERVER LOGS */}
            <div className="bg-black rounded-xl shadow-sm border border-slate-800 overflow-hidden flex flex-col">
              <div className="bg-slate-900 px-4 py-2 flex items-center gap-2 border-b border-slate-800">
                <Terminal className="w-4 h-4 text-green-400" />
                <h2 className="text-xs font-semibold text-slate-300 tracking-wider">SERVER LOG</h2>
                <button onClick={() => setLogs([])} className="ml-auto text-xs text-slate-500 hover:text-slate-300">Xóa log</button>
              </div>
              <div className="p-4 flex-1 overflow-y-auto font-mono text-xs space-y-2 h-[250px]">
                {logs.length === 0 && <span className="text-slate-600 italic">Đang chờ request...</span>}
                {logs.map((log, i) => (
                  <div key={i} className="flex gap-2">
                    <span className="text-slate-500 shrink-0">[{log.time}]</span>
                    <span className={`
                      ${log.type === 'error' ? 'text-red-400' : ''}
                      ${log.type === 'success' ? 'text-green-400' : ''}
                      ${log.type === 'info' ? 'text-blue-300' : ''}
                    `}>
                      {log.message}
                    </span>
                  </div>
                ))}
                <div ref={logsEndRef} />
              </div>
            </div>

            {/* RESPONSE */}
            <div className="bg-white rounded-xl shadow-sm border border-slate-200 overflow-hidden flex flex-col">
              <div className="bg-slate-100 px-4 py-2 flex items-center gap-2 border-b border-slate-200">
                <ArrowRight className="w-4 h-4 text-slate-500" />
                <h2 className="text-xs font-bold text-slate-700 tracking-wider">HTTP RESPONSE</h2>
                {response && (
                  <span className={`ml-auto px-2 py-0.5 text-xs font-bold rounded ${
                    response.status < 300 ? 'bg-green-100 text-green-700' : 'bg-red-100 text-red-700'
                  }`}>
                    {response.status}
                  </span>
                )}
              </div>
              <div className="p-4 flex-1 bg-slate-50 overflow-y-auto">
                {response ? (
                  <pre className="font-mono text-sm text-slate-800 whitespace-pre-wrap">
                    {response.body ? JSON.stringify(response.body, null, 2) : "No Content (Trống)"}
                  </pre>
                ) : (
                  <div className="h-full flex items-center justify-center text-slate-400 text-sm italic">
                    {isProcessing ? 'Đang chờ server xử lý...' : 'Chưa có dữ liệu phản hồi'}
                  </div>
                )}
              </div>
            </div>
          </div>

        </div>
      </div>
    </div>
  );
}