import React, { useState, useEffect } from "react";
import "./LeftSidebar.css";
import assets from "../../assets/assets";
import { useNavigate } from "react-router-dom";
import api from '../../api';

const LeftSidebar = ({ setActiveChatId }) => { // Recibir setActiveChatId como prop
  const [search, setSearch] = useState("");
  const [chats, setChats] = useState([]);
  const [contacts, setContacts] = useState([]);
  const [filteredChats, setFilteredChats] = useState([]);

  const navigate = useNavigate();

  // Función para cargar los chats y contactos desde la API
  useEffect(() => {
    const fetchData = async () => {
      try {
        const token = localStorage.getItem("token");

        if (!token) {
          console.error("Token no disponible. Redirigiendo al login.");
          navigate("/login");
          return;
        }

        const headers = { Authorization: `Bearer ${token}` };

        // Obtener los contactos del usuario
        const contactsResponse = await api.get("/api/Users/contacts", { headers });
        setContacts(contactsResponse.data || []);
        console.log("Contactos: ", JSON.stringify(contactsResponse.data, null, 2));

        // Obtener los chats del usuario
        const chatsResponse = await api.get("/api/Chats", { headers });
        console.log("Chats: ", JSON.stringify(chatsResponse.data));

        setChats(Array.isArray(chatsResponse.data) ? chatsResponse.data : []);

      } catch (error) {
        console.error("Error al cargar datos desde la API:", error);
        if (error.response && error.response.status === 401) {
          console.error("Token inválido o expirado. Redirigiendo al login.");
          navigate("/login");
        }
      }
    };

    fetchData();
  }, [navigate]);

  // Actualiza los chats filtrados según el valor de búsqueda
  useEffect(() => {
    const filtered = chats.filter((chat) => {
      const chatName = chat.isGroup
        ? chat.groupName
        : chat.members && chat.members.length > 0
        ? chat.members.map(memberId => {
            const contact = contacts.find((contact) => contact._id === memberId);
            return contact ? contact.username : "Unknown";
          }).join(", ")
        : "Unknown";

      console.log("Filtrando chat: ", chatName, chat); // Agregado para depuración
      return chatName?.toLowerCase().includes(search.toLowerCase());
    });
    setFilteredChats(filtered);
  }, [search, chats, contacts]);

  // Manejar cierre de sesión
  const handleLogout = () => {
    localStorage.removeItem("token");
    navigate("/login");
  };

  return (
    <div className="ls">
      <div className="ls-top">
        <div className="ls-nav">
          <img src={assets.logo} className="logo" alt="Logo" />
          <div className="menu">
            <img src={assets.menu_icon} alt="Menu" />
            <div className="sub-menu">
              <p onClick={() => navigate("/profile")}>Edit profile</p>
              <hr />
              <p onClick={handleLogout}>Logout</p>
            </div>
          </div>
        </div>
        <div className="ls-search">
          <img src={assets.search_icon} alt="Search" />
          <input
            type="text"
            placeholder="Search here.."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
          />
        </div>
      </div>

      <div className="ls-list">
        {filteredChats.length > 0 ? (
          filteredChats.map((chat) => (
            <div
                key={chat._id}
                className="friends"
                onClick={() => {
                  setActiveChatId(chat._id); // Actualizar el chat activo
                  navigate(`/chat/${chat._id}`);
                }}
              >
              <img
                src={
                  chat.isGroup
                    ? chat.groupAvatar || assets.profile_img
                    : chat.members.length > 0 &&
                      contacts.find(
                        (contact) => contact._id === chat.members[0]
                      )?.avatar || assets.profile_img
                }
                alt="Avatar"
              />
              <div>
                <p>
                  {chat.isGroup
                    ? chat.groupName
                    : chat.members && chat.members.length > 0
                    ? chat.members.map(memberId => {
                        const contact = contacts.find((contact) => contact._id === memberId);
                        return contact ? contact.username : "";
                      }).join("")
                    : "Unknown"}
                </p>
                <span> 
                  {!chat.lastMessage
                    ? "Sin mensajes" 
                    : !chat.lastMessageSender 
                    ? chat.lastMessage 
                    : `${chat.lastMessageSender}: ${chat.lastMessage}`}

                </span>
              </div>
            </div>
          ))
        ) : (
          <p>No hay chats disponibles</p>
        )}
      </div>
    </div>
  );
};

export default LeftSidebar;


