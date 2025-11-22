
import React, { useState, useEffect } from 'react';
import { Send, Paperclip, CheckCircle, MoreVertical } from 'lucide-react';
import { useLocation } from 'react-router-dom';

export const Messages: React.FC = () => {
  const location = useLocation();
  const [selectedChatId, setSelectedChatId] = useState(0);
  const [isOfferAccepted, setIsOfferAccepted] = useState(false);
  
  const [chats, setChats] = useState([
    { id: 0, name: 'Alex P.', item: 'Vintage Gameboy', lastMsg: 'I can ship it tomorrow.', unread: true, avatar: 'https://picsum.photos/50/50?random=1' },
    { id: 1, name: 'Sarah M.', item: 'Custom Cabinet', lastMsg: 'Does $200 work for you?', unread: false, avatar: 'https://picsum.photos/50/50?random=2' },
    { id: 2, name: 'Davide R.', item: 'Lost Keys', lastMsg: 'Found them near the park!', unread: false, avatar: 'https://picsum.photos/50/50?random=3' },
  ]);

  useEffect(() => {
    if (location.state?.startChatWith) {
      const { name, avatar } = location.state.startChatWith;
      
      // Check if chat already exists with this person (mock check by name)
      const existingChat = chats.find(c => c.name === name);
      
      if (existingChat) {
        setSelectedChatId(existingChat.id);
      } else {
        // Create new chat
        const newChatId = Math.max(...chats.map(c => c.id)) + 1;
        const newChat = {
          id: newChatId,
          name: name,
          item: 'General Inquiry',
          lastMsg: 'Start of conversation',
          unread: false,
          avatar: avatar
        };
        setChats([newChat, ...chats]);
        setSelectedChatId(newChatId);
      }
    }
  }, [location.state]);

  const messages = [
    { id: 1, sender: 'them', text: 'Hi! I saw your request for the Gameboy. I have one in mint condition.', time: '10:30 AM' },
    { id: 2, sender: 'me', text: 'That sounds perfect. Do you have the original box?', time: '10:32 AM' },
    { id: 3, sender: 'them', text: 'Yes, original box and manual included.', time: '10:35 AM' },
    { id: 4, sender: 'me', text: 'Awesome. Can you do $120 shipping included?', time: '10:36 AM' },
    { id: 5, sender: 'them', text: 'I can ship it tomorrow for that price.', time: '10:40 AM' },
  ];

  const activeChat = chats.find(c => c.id === selectedChatId) || chats[0];

  const handleAcceptOffer = () => {
    if (window.confirm("Are you sure you want to accept this offer? This will close the request.")) {
      setIsOfferAccepted(true);
      alert("Offer accepted! The request is now closed and will be deleted in 30 days.");
    }
  };

  return (
    <div className="h-[calc(100vh-64px)] flex flex-col md:flex-row bg-offWhite">
      {/* Sidebar List */}
      <div className="w-full md:w-1/3 bg-white border-r border-gray-200 flex flex-col">
        <div className="p-4 border-b border-gray-200">
          <h2 className="text-xl font-bold text-deepBlue">Messages</h2>
        </div>
        <div className="flex-1 overflow-y-auto">
          {chats.map((chat, idx) => (
            <div 
              key={chat.id} 
              onClick={() => {
                setSelectedChatId(chat.id);
                setIsOfferAccepted(false); // Reset for demo purposes when switching chats
              }}
              className={`flex items-center p-4 cursor-pointer hover:bg-gray-50 transition-colors border-b border-gray-100 ${selectedChatId === chat.id ? 'bg-blue-50 border-l-4 border-l-softTeal' : ''}`}
            >
              <img src={chat.avatar} alt={chat.name} className="h-12 w-12 rounded-full mr-4" />
              <div className="flex-1 min-w-0">
                <div className="flex justify-between items-baseline">
                  <h3 className="font-bold text-gray-800 truncate">{chat.name}</h3>
                  {chat.unread && <span className="h-2 w-2 bg-red-500 rounded-full"></span>}
                </div>
                <p className="text-xs text-softTeal font-medium mb-1">{chat.item}</p>
                <p className="text-sm text-gray-500 truncate">{chat.lastMsg}</p>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Chat Window */}
      <div className="flex-1 flex flex-col">
        {/* Header */}
        {activeChat && (
          <div className="p-4 bg-white border-b border-gray-200 flex justify-between items-center shadow-sm z-10">
            <div className="flex items-center">
               <img src={activeChat.avatar} className="h-10 w-10 rounded-full mr-3" />
               <div>
                  <h3 className="font-bold text-gray-800">{activeChat.name}</h3>
                  <p className="text-xs text-gray-500">Regarding: <span className="text-softTeal font-medium">{activeChat.item}</span></p>
               </div>
            </div>
            <div className="flex items-center space-x-3">
              <button className="text-gray-400 hover:text-deepBlue"><MoreVertical className="h-5 w-5" /></button>
            </div>
          </div>
        )}

        {/* Pinned Offer */}
        <div className="bg-blue-50 px-4 py-3 flex justify-between items-center border-b border-blue-100">
           <div className="flex items-center">
              <CheckCircle className={`h-5 w-5 ${isOfferAccepted ? 'text-gray-600' : 'text-green-500'} mr-2`} />
              <div className="text-sm text-blue-900">
                Offer: <strong>$120.00</strong> • Delivery: <strong>3 Days</strong>
              </div>
           </div>
           {isOfferAccepted ? (
              <div className="text-right">
                  <button disabled className="bg-gray-200 text-gray-600 border border-gray-300 text-xs px-3 py-1.5 rounded font-medium cursor-default">
                    Request Closed
                  </button>
                  <p className="text-[10px] text-gray-500 mt-1">Deleted in 30 days</p>
              </div>
           ) : (
              <button 
                onClick={handleAcceptOffer}
                className="bg-green-600 text-white text-xs px-3 py-1.5 rounded hover:bg-green-700 font-medium transition-colors"
              >
                Accept
              </button>
           )}
        </div>

        {/* Messages */}
        <div className="flex-1 overflow-y-auto p-4 space-y-4 bg-gray-50">
          {messages.map((msg) => (
             <div key={msg.id} className={`flex ${msg.sender === 'me' ? 'justify-end' : 'justify-start'}`}>
                <div className={`max-w-[75%] rounded-2xl px-4 py-3 shadow-sm ${msg.sender === 'me' ? 'bg-softTeal text-white rounded-tr-none' : 'bg-white text-gray-800 rounded-tl-none'}`}>
                   <p className="text-sm">{msg.text}</p>
                   <p className={`text-[10px] mt-1 text-right ${msg.sender === 'me' ? 'text-blue-100' : 'text-gray-400'}`}>{msg.time}</p>
                </div>
             </div>
          ))}
        </div>

        {/* Input */}
        <div className="p-4 bg-white border-t border-gray-200">
           <div className="flex items-center space-x-2 bg-gray-100 rounded-full px-4 py-2">
              <button className="text-gray-400 hover:text-gray-600"><Paperclip className="h-5 w-5" /></button>
              <input type="text" placeholder="Type a message..." className="flex-1 bg-transparent focus:outline-none text-sm" />
              <button className="p-2 bg-deepBlue text-white rounded-full hover:bg-opacity-90"><Send className="h-4 w-4" /></button>
           </div>
        </div>
      </div>
    </div>
  );
};
