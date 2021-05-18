import React, { useEffect ,useRef, useState } from 'react';

import EmailEditor from 'react-email-editor';

function App() {
  const emailEditorRef = useRef(null);

  const [isLogin, setIsLogin] = useState(false)
  const [templates, setTemplates] = useState([])
  const [user, setUser] = useState('')

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
          get_templates();
        }
      })
  })

  const get_templates = () => {
    fetch('/api/get/' + user)
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
      console.log('export for user: ', user);
      fetch('/api/save/' + user, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify(design)
      }).then(response => response.json())
        .then(result => console.log('save'))
    });
  };

  const onLoad = (id) => {
    // you can load your template here;
    // const templateJson = {};
    // emailEditorRef.current.editor.loadDesign(templateJson);
    templates.map((each) => {
      if (each._id = id) {
        console.log('loading: ', each._id);
        emailEditorRef.current.editor.loadDesign(each)
      }
    })
  };

  
  return (
    <div>
    {isLogin ? 
      <div>
        <div>
          <button onClick={exportHtml}>Export HTML</button>
        </div>
        <div>
          Saved Templates
          {templates.map((each) => {
            return (
              <div>
                <button onClick={() => onLoad(each._id)}>Template {each._id}</button>
              </div>
            )
          })}
        </div>
      <EmailEditor
        ref={emailEditorRef}
        onLoad={onLoad}
      />
      </div>
      
        :
        <a href="/login">Login to continue</a> 
    }
      
    </div>
  );
}

export default App;
