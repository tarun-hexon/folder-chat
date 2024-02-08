
export async function fetchCredentialID(body) {
    try {
        const data = await fetch(`/api/manage/credential`, {
            method: 'POST',
            headers: {
                "Content-Type": "application/json",

            },
            body: JSON.stringify(body)
        });
        const json = await data.json();
        return json.id
    } catch (error) {
        throw error
    }
};


export async function connectorRequest(baseURL) {
    try {
        const data = await fetch(`/api/manage/admin/connector`, {
            method: 'POST',
            headers: {
                "Content-Type": "application/json"
            },
            body: JSON.stringify({
                "name": `WebConnector-${baseURL}`,
                "source": "web",
                "input_type": "load_state",
                "connector_specific_config": {
                    "base_url": baseURL
                },
                "refresh_freq": 86400,
                "disabled": false
            })
        }
            
        );
        const json = await data.json();
        return json.id
        
        
    } catch (error) {
        throw error
    }        
};


export async function sendURL(connectorId, credentialID, baseURL){
    console.log(connectorId, credentialID)
    try {
        const data = await fetch(`/api/manage/connector/${connectorId}/credential/${credentialID}`, {
        method: 'PUT',
            headers: {
                "Content-Type": "application/json",
            },
            body: JSON.stringify({'name':baseURL})
        });
        const json = await data.json();
       return json
    } catch (error) {
        throw error
        
    }
};

export async function fetchAllCredentials(){
    try {
        const data = await fetch(`/api/manage/admin/credential`);
        const json = await data.json();
        return json;
                
    } catch (error) {
        return error
    }
};


export async function fetchAllConnector(){
    try {
        const data = await fetch(`/api/manage/connector`);
        const json = await data.json();
        return json
    } catch (error) {
        throw error
    }
}

export async function deleteConnector(id){
    try {
        const data = await fetch(`/api/manage/admin/connector/${id}`, {
            method:"delete"
        }
        );
        console.log(data)
    } catch (error) {
        console.log(error)
    }
};


export async function generateConnectorId(body){
    try {
        const data = await fetch(`/api/manage/admin/connector`,{
            method: 'POST',
            headers: {
                "Content-Type": "application/json"
            },
            body: JSON.stringify(body)
        });
        const json = await data.json();
        return json
        
    } catch (error) {
        throw error
    }
};

export async function addNewInstance(conId, credId, name){
    try {
        const data = await fetch(`/api/manage/connector/${conId}/credential/${credId}`,{
            method: 'PUT',
            headers: {
                "Content-Type": "application/json"
            },
            body: JSON.stringify({
                name: name
        })
        });
        const json = await data.json();
        return json
    } catch (error) {
        throw error
    }
};

export async function deleteAdminCredentails(id){
    try {
        const data = await fetch(`/api/manage/admin/credential/${id}`, {
            method:'DELETE'
        });
        console.log(data)
    } catch (error) {
        throw error
    }
    
};


export async function fetchConnectorStatus(id) {
    try {
        const data = await fetch(`/api/manage/admin/cc-pair/${id}`);
        const json = await data.json();
        return json
    } catch (error) {
        throw error
    }
};

export async function deleteConnectorFromTable(body){
   try {
    const data = await fetch(`/api/manage/admin/deletion-attempt`, {
        method:'POST',
        body:JSON.stringify(body)
    });
   } catch (error) {
        throw error
   }

};


export async function fetchCCPairId(){
    try {
        const data = await fetch(`/api/manage/admin/connector/indexing-status`);
        const json = await data.json();
        // const ids = json?.filter(item => item.cc_pair_id)
        return json
    } catch (error) {
        return error
    }
};

export async function fetchIndexing(){
    try {
        const data = await fetch(`/api/manage/admin/connector/indexing-status`);
        // const json = await data.json();
        
        return data
    } catch (error) {
        return error
    }
}


function getLastSuccessfulMessageId(messageHistory) {
    const lastSuccessfulMessage = messageHistory
      .slice()
      .reverse()
      .find(
        (message) =>
          message.type === "assistant" &&
          message.messageId !== -1 &&
          message.messageId !== null
      );
    return lastSuccessfulMessage ? lastSuccessfulMessage.messageId : null;
  }
  