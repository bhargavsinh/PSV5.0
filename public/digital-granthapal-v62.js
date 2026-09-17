/**
 * Digital Granthapal — V4.0 (site V4.0)
 * ADD-ONLY real-time search bridge.
 * Sends the exact user query to granthas.html?q=... and lets the existing
 * Grantha search engine render the results. No external API/dependency.
 */
(function(){
  'use strict';
  if(window.__DG_V62_SEARCH_LOADED) return;
  window.__DG_V62_SEARCH_LOADED = true;

  function rootUrl(rel){
    try{
      var p=window.location.pathname||'';
      var parts=p.split('/').filter(Boolean);
      if(parts.length && parts[parts.length-1].indexOf('.')!==-1) parts.pop();
      if(parts[0]==='policies') return '../'+rel;
      return rel;
    }catch(e){ return rel; }
  }

  function addCss(){
    if(document.getElementById('dg-v62-css')) return;
    var l=document.createElement('link');
    l.id='dg-v62-css'; l.rel='stylesheet';
    l.href=rootUrl('digital-granthapal-v62.css');
    document.head.appendChild(l);
  }

  function isGranthaPage(){
    return /(?:^|\/)granthas\.html$/i.test(window.location.pathname||'');
  }

  function currentGranthaInput(){
    return document.getElementById('search-input');
  }

  function goToSearch(query){
    var q=String(query||'').trim();
    if(isGranthaPage()){
      var input=currentGranthaInput();
      if(input){
        input.value=q;
        input.dispatchEvent(new Event('input',{bubbles:true}));
        try{ history.replaceState(null,'',q ? 'granthas.html?q='+encodeURIComponent(q) : 'granthas.html'); }catch(e){}
        input.focus();
        return;
      }
    }
    var url=rootUrl('granthas.html');
    if(q){
      var params=new URLSearchParams();
      params.set('q',q);
      url+='?'+params.toString();
    }
    window.location.href=url;
  }

  function enhance(){
    var panel=document.getElementById('dg-panel');
    if(!panel || document.getElementById('dg-v62-search')) return;

    var desc=document.getElementById('dg-panel-desc');
    var wrap=document.createElement('div');
    wrap.id='dg-v62-search';
    wrap.setAttribute('role','search');

    var input=document.createElement('input');
    input.id='dg-v62-search-input';
    input.type='search';
    input.placeholder='Search Grantha…';
    input.autocomplete='off';
    input.enterKeyHint='search';
    input.setAttribute('aria-label','Search Grantha directly');

    var button=document.createElement('button');
    button.id='dg-v62-search-submit';
    button.type='button';
    button.textContent='Search';
    button.setAttribute('aria-label','Search Grantha');

    wrap.appendChild(input); wrap.appendChild(button);

    var status=document.createElement('div');
    status.id='dg-v62-search-status';
    status.setAttribute('aria-live','polite');

    if(desc && desc.parentNode) desc.parentNode.insertBefore(wrap,desc.nextSibling);
    else panel.insertBefore(wrap,panel.firstChild);
    wrap.parentNode.insertBefore(status,wrap.nextSibling);

    function submit(){
      var q=input.value.trim();
      if(!q){ input.focus(); return; }
      status.textContent='Opening Grantha search…';
      try{
        var avatar=document.getElementById('dg-avatar-btn');
        if(avatar) avatar.className='dg-search';
      }catch(e){}
      goToSearch(q);
    }

    button.addEventListener('click',submit);
    input.addEventListener('keydown',function(e){
      if(e.key==='Enter'){ e.preventDefault(); submit(); }
      if(e.key==='Escape'){ input.value=''; status.textContent=''; input.focus(); }
    });

    /* On the Grantha page, typing in the Digital Granthapal box updates the
       existing Grantha search field live without creating a second dataset. */
    var timer;
    input.addEventListener('input',function(){
      if(!isGranthaPage()) return;
      clearTimeout(timer);
      var q=input.value;
      timer=setTimeout(function(){
        var target=currentGranthaInput();
        if(!target) return;
        target.value=q;
        target.dispatchEvent(new Event('input',{bubbles:true}));
        status.textContent=q.trim() ? 'Live results updated below.' : '';
      },120);
    });

    if(isGranthaPage()){
      var target=currentGranthaInput();
      if(target) input.value=target.value||'';
    }
  }

  function boot(){
    addCss();
    enhance();
    if(!document.getElementById('dg-panel')){
      var observer=new MutationObserver(function(){
        enhance();
        if(document.getElementById('dg-panel')) observer.disconnect();
      });
      observer.observe(document.documentElement,{childList:true,subtree:true});
    }
  }

  if(document.readyState==='loading') document.addEventListener('DOMContentLoaded',boot);
  else boot();
})();
