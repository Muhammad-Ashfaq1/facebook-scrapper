// Listen for messages from popup
chrome.runtime.onMessage.addListener((request, sender, sendResponse) => {
  if (request.action === "checkFacebookGroup") {
    chrome.tabs.query({active: true, currentWindow: true}, (tabs) => {
      const url = tabs[0].url;
      const isFacebookGroup = url.includes('facebook.com/groups/');
      sendResponse({isFacebookGroup});
    });
    return true;
  }
  
  if (request.action === "injectScript") {
    chrome.tabs.query({active: true, currentWindow: true}, async (tabs) => {
      const tab = tabs[0];
      
      // Initial console message and script injection
      await chrome.scripting.executeScript({
        target: { tabId: tab.id },
        func: () => {
          console.clear();
          
          console.log('%c Facebook Group Members Extractor ', 'background: #1877f2; color: white; font-size: 16px; font-weight: bold; padding: 4px;');
          console.log('Starting script injection...');

          // Direct script execution
          function exportToCsv(e,t){for(var n="",o=0;o<t.length;o++)n+=function(e){for(var t="",n=0;n<e.length;n++){var o=null===e[n]||void 0===e[n]?"":e[n].toString(),o=(o=e[n]instanceof Date?e[n].toLocaleString():o).replace(/"/g,'""');0<n&&(t+=","),t+=o=0<=o.search(/("|,|\n)/g)?'"'+o+'"':o}return t+"\n"}(t[o]);var r=new Blob([n],{type:"text/csv;charset=utf-8;"}),i=document.createElement("a");void 0!==i.download&&(r=URL.createObjectURL(r),i.setAttribute("href",r),i.setAttribute("download",e),document.body.appendChild(i),i.click(),document.body.removeChild(i))}function buildCTABtn(){var e=document.createElement("div"),t=(e.setAttribute("style",["position: fixed;","top: 0;","left: 0;","z-index: 10;","width: 100%;","height: 100%;","pointer-events: none;"].join("")),document.createElement("div")),n=(t.setAttribute("style",["position: absolute;","bottom: 30px;","right: 130px;","color: white;","min-width: 150px;","background: var(--primary-button-background);","border-radius: var(--button-corner-radius);","padding: 0px 12px;","cursor: pointer;","font-weight:600;","font-size:15px;","display: inline-flex;","pointer-events: auto;","height: 36px;","align-items: center;","justify-content: center;"].join("")),document.createTextNode("Download ")),o=document.createElement("span"),r=(o.setAttribute("id","fb-group-scraper-number-tracker"),o.textContent="0",document.createTextNode(" members"));return t.appendChild(n),t.appendChild(o),t.appendChild(r),t.addEventListener("click",function(){var e=(new Date).toISOString();exportToCsv("groupMemberExport-".concat(e,".csv"),window.members_list)}),e.appendChild(t),document.body.appendChild(e),e}function processResponse(e){var t;if(null!==(n=null==e?void 0:e.data)&&void 0!==n&&n.group)o=e.data.group;else{if("Group"!==(null===(n=null===(n=null==e?void 0:e.data)||void 0===n?void 0:n.node)||void 0===n?void 0:n.__typename))return;o=e.data.node}if(null!==(n=null==o?void 0:o.new_members)&&void 0!==n&&n.edges)t=o.new_members.edges;else{if(null===(e=null==o?void 0:o.new_forum_members)||void 0===e||!e.edges)return;t=o.new_forum_members.edges}var n=t.map(function(e){var t=e.node,n=t.id,o=t.name,r=t.bio_text,i=t.url,d=t.profile_picture,t=t.__isProfile,s=(null===(s=null==e?void 0:e.join_status_text)||void 0===s?void 0:s.text)||(null===(s=null===(s=null==e?void 0:e.membership)||void 0===s?void 0:s.join_status_text)||void 0===s?void 0:s.text),e=null===(e=e.node.group_membership)||void 0===e?void 0:e.associated_group.id;return[n,o,i,(null==r?void 0:r.text)||"",(null==d?void 0:d.uri)||"",e,s||"",t]}),o=((e=window.members_list).push.apply(e,n),document.getElementById("fb-group-scraper-number-tracker"));o&&(o.textContent=window.members_list.length.toString())}function parseResponse(e){var n=[];try{n.push(JSON.parse(e))}catch(t){var o=e.split("\n");if(o.length<=1)return void console.error("Fail to parse API response",t);for(var r=0;r<o.length;r++){var i=o[r];try{n.push(JSON.parse(i))}catch(e){console.error("Fail to parse API response",t)}}}for(var t=0;t<n.length;t++)processResponse(n[t])}function main(){buildCTABtn();var e=XMLHttpRequest.prototype.send;XMLHttpRequest.prototype.send=function(){this.addEventListener("readystatechange",function(){this.responseURL.includes("/api/graphql/")&&4===this.readyState&&parseResponse(this.responseText)},!1),e.apply(this,arguments)}}window.members_list=window.members_list||[["Profile Id","Full Name","ProfileLink","Bio","Image Src","Groupe Id","Group Joining Text","Profile Type"]],main();

          console.log('%c Script injected successfully! ', 'background: #4BB543; color: white; font-size: 14px; font-weight: bold; padding: 4px;');
          console.log('Start scrolling the members list to extract data...');
        }
      });

      sendResponse({success: true});
    });
    return true;
  }
}); 