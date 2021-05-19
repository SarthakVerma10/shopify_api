import React, { useEffect ,useRef, useState } from 'react';

import EmailEditor from 'react-email-editor';

function App() {
  const emailEditorRef = useRef(null);

  const [isLogin, setIsLogin] = useState(false)
  const [templates, setTemplates] = useState([])
  const [user, setUser] = useState('')
  const [editTemplate, setEditTemplate] = useState(false)

  useEffect(() => {
    fetch('/api/session')
      .then(response => response.json())
      .then(result => {
        console.log('result: ', result)
        if (result === false) {
        } else {
          setIsLogin(true)
          console.log('id: ', result.onlineAccessInfo.associated_user.id);
          setUser(result.onlineAccessInfo.associated_user.id)
          console.log('userid: ', user);
          get_templates(result.onlineAccessInfo.associated_user.id);
        }
      })
  }, [])

  const get_templates = (id) => {
    fetch('/api/get/' + id)
      .then(res => res.json())
      .then(result => {
        console.log('templates: ', result)
        setTemplates(result)
      })
  }

  const exportHtml = () => {
    emailEditorRef.current.editor.exportHtml((data) => {
      const { design, html } = data;
      //console.log('exportHtml', html);
      console.log('design: ', design);
      //design['user'] = user;
      //console.log('export for user: ', user);
      // fetch('/api/save/' + user, {
      //   method: 'POST',
      //   headers: {
      //     'Content-Type': 'application/json'
      //   },
      //   body: JSON.stringify(design)
      // }).then(response => response.json())
      //   .then(result => console.log('save'))

      fetch('/api/save/' + user, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify(design)
      }).then(r => r.json())
        .then(re => console.log('response for save: ', re))
    });
  };

  const onLoad = (id) => {
    // you can load your template here;
    // const templateJson = {};
    // emailEditorRef.current.editor.loadDesign(templateJson);

    templates.map((each) => {
      if (each._id === id) {
        console.log('loading: ', each._id);
        return emailEditorRef.current.editor.loadDesign(each)
      }
    })
  };

  const newLoad = () => {
    emailEditorRef.current.editor.loadBlank()
    setEditTemplate(false)
  }

  const editSaved = () => {
    setEditTemplate(true)
  }

  const update = (id) => {
    emailEditorRef.current.editor.exportHtml((data) => {
      const { design } = data
      console.log('updated template: ', design);
      fetch('/api/update/' + id, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json'
      },
      body: JSON.stringify(design)
    }).then(r => r.json())
      .then(res => console.log('update result: ', res))
    })
    
  }
  
  return (
    <div>
    {isLogin ? <div>
      <div>
        <button onClick={newLoad}>New Template</button>
        <button onClick={editSaved}>Edit Saved Template</button>
        <button onClick={exportHtml}>Save</button>
      </div>
      {editTemplate ?
        <div>
        Saved Templates
        {templates.map((each) => {
          return (
            <div key={each._id}>
              <button key={each._id} onClick={() => onLoad(each._id)}>Template {each._id}</button>
              <button onClick={() => update(each._id)}>Update</button>
            </div>
          )
        })}
        
      </div>
        : 
        
        <p></p>}
      
    <EmailEditor
      ref={emailEditorRef}
    />
    </div>
        :
        <a href="/login">Login</a>
  }
      

      
    </div>
  );
}

export default App;
