import user from '../public/assets/user.svg';
import creditCardIcon from '../public/assets/credit-card.svg';
import settingsIcon from '../public/assets/settings.svg';
import {CreditCard, Keyboard, Settings, Upload, User, Edit, Trash2, MessagesSquare } from "lucide-react";
import showAllIcon from '../public/assets/Danswer-All.svg';
import threeLines from '../public/assets/Danswer-All-B.svg'

import gDriveIcon from '../public/assets/Danswer-google.svg';
import slackIcon from '../public/assets/Danswer-slack.svg';
import confluenceIcon from '../public/assets/Danswer-confluence.svg';
import gitPrsIcon from '../public/assets/Danswer-github.svg';
import webIcon from '../public/assets/Danswer-web.svg';
import filesIcon from '../public/assets/Danswer-doc.svg';
import fileIconB from '../public/assets/Danswer-doc-B.svg';
import gDriveIconB from '../public/assets/Danswer-google-B.svg'
import webB from '../public/assets/Danswer-web-B.svg'
import slackIconB from '../public/assets/Danswer-slack-B.svg'
import confluenceIconB from '../public/assets/Danswer-confluence-B.svg'
import gitIconB from '../public/assets/Danswer-github-B.svg';
import pdfIcon from '../public/assets/pdf.svg'
import docIcon from '../public/assets/doc.svg'
import xlsIcon from '../public/assets/xls.svg'
import txtIcon from '../public/assets/txt-file.svg'


export const selectOptions = [
    {
      id:'option_1',
      title: 'What kind of work you do?',
      values: [
        {
          value:'Founder / CEO'
        },
        {
          value:'Internal Communication'
        },
        {
          value:'Product Management'
        },
        {
          value:'Knowledge Management'
        },
        {
          value:'Marketing'
        },
        {
          value:'Creative'
        },
        {
          value:'Finance'
        },
        {
          value:'Project / Program Management'
        },
        {
          value:'Product Design'
        },
        {
          value:'Student'
        },
        {
          value:'Engineering'
        },
        {
          value:'Educator'
        },
        {
          value:'Operations'
        },
        {
          value:'Customer Service'
        },
        {
          value:'Human Resources'
        },
        {
          value:'IT Admin'
        },
        {
          value:'Sales'
        },
        {
          value:'Other'
        }

      ]
    },
    {
      id:'option_2',
      title: 'What is your role?',
      values:[
        {
          value:'Executive (C-level / VP)'
        },
        {
          value:'Department lead'
        },
        {
          value:'Team manager/lead'
        },
        {
          value:'Team member'
        },
        {
          value:'Solo-preneur / Freelancer'
        }
      ]
    },
    {
      id:'option_3',
      title: 'Roughly how many people work at your company?',
      values: [
        {
          value:'1 - 49',
        },
        {
          value:'50 - 99',
        },
        {
          value:'100 - 499',
        },
        {
          value:'500 - 999'
        },
        {
          value:'1000+'
        }
      ]
      
    },
    {
      id:'option_4',
      title: 'What are you planning to use folder.chat for?',
      values: [
        {
          value:'Create a common knowledge base'
        },
        {
          value:'Collaborate with others over specific info'
        },
        {
          value:'Drive KT'
        },
        {
          value:'Write with Al'
        },
        {
          value:'Other'
        }
      ]
    }
];

export const sidebarOptions = [
    {
        title: 'My Profile',
        icon: user,
        id:'profile'
    },
    {
        title: 'Plan',
        icon: creditCardIcon,
        id:'plans'
    },
    {
        title: 'Settings',
        icon: settingsIcon,
        id:'settings'
    },
    
];

export const plans = [
  "Collaborative workspace",
  "Slack, GitHub, and more integrations",
  "Unlimited blocks for teams",
  "Unlimited file uploads",
  "30 day page history",
  "Invite up to 100 guests"
];

export const setting = [
  {
    title: 'My Profile',
    icon: User,
    id:'profile'
  },
  {
    title: 'Plans',
    icon: CreditCard,
    id:'plans'
  },
  {
    title: 'Settings',
    icon: Settings,
    id:'settings'
  },
  {
    title: 'Notification Settings',
    icon: Keyboard,
    id:'n-settings'
  },
];

export const folderOptions = [
  {
    id:'new-chat',
    title:'New Chat',
    icon: MessagesSquare
  },
  {
    id:'edit',
    title:'Edit',
    icon: Edit
  },
  {
    id:'upload',
    title:'Upload New File',
    icon: Upload
  },
  {
    id:"delete",
    title:'Delete',
    icon:Trash2
  }
];

export const docsOptions = [
  {
    id:"delete",
    title:'Delete',
    icon:Trash2
  }
];


export const advanceOption = [
  {
    id:'indexing',
    title:'Indexing',
    icon: showAllIcon
  },
  // {
  //   id:'drive',
  //   title:'Google Drive',
  //   icon: gDriveIcon
  // },
  // {
  //   id:'slack',
  //   title:'Slack',
  //   icon: slackIcon
  // },
  // {
  //   id:'confluence',
  //   title:'Confluence',
  //   icon: confluenceIcon
  // },
  // {
  //   id:'github',
  //   title:'Github PRs',
  //   icon: gitPrsIcon
  // },
  {
    id:'web',
    title:'Web',
    icon: webIcon
  },
  {
    id:'files',
    title:'Files',
    icon: filesIcon
  }
];

export function iconSelector(icon){
  if(icon === "web"){
      return webB
  }else if(icon === "file"){
      return fileIconB
  }else if(icon === "github"){
      return gitIconB
  }else if(icon === "slack"){
      return slackIconB
  }else if(icon === "confluence"){
      return confluenceIconB
  }else if(icon === "pdf"){
    return pdfIcon
  }else if(icon === "xls"){
      return xlsIcon
  }else if(icon === "docx" || icon === "doc"){
      return docIcon
  }else if(icon === "drive"){
      return gDriveIconB
  }else if(icon === "txt"){
    return txtIcon
}
  
};


