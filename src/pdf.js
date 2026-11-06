'use strict';
(() => {
  // Small text-only training export. Unsupported characters are rejected, never silently replaced.
  const extra = {'€':128,'‚':130,'ƒ':131,'„':132,'…':133,'†':134,'‡':135,'ˆ':136,'‰':137,'Š':138,'‹':139,'Œ':140,'Ž':142,'‘':145,'’':146,'“':147,'”':148,'•':149,'–':150,'—':151,'˜':152,'™':153,'š':154,'›':155,'œ':156,'ž':158,'Ÿ':159};
  const supported = text => [...text].every(c=>c==='\n'||c==='\r'||c==='\t'||(c.charCodeAt(0)>=32&&c.charCodeAt(0)<=126)||(c.charCodeAt(0)>=160&&c.charCodeAt(0)<=255)||Object.hasOwn(extra,c));
  const literal = text => [...text].map(c=>{const n=extra[c]??c.charCodeAt(0);return n>126?'\\'+n.toString(8).padStart(3,'0'):/[()\\]/.test(c)?'\\'+c:c;}).join('');
  const wrap = text => String(text).replace(/\r\n?/g,'\n').split('\n').flatMap(line=>{
    const result=[]; while(line.length>80){let cut=line.lastIndexOf(' ',80);if(cut<1)cut=80;result.push(line.slice(0,cut));line=line.slice(cut+(line[cut]===' '?1:0));}result.push(line);return result;
  });
  const bytes = lines => {
    if(!lines.every(supported))throw new Error('The training PDF supports Latin/Western punctuation only. Use the HTML preview for other scripts.');
    const content=lines.flatMap(wrap),chunks=[];
    for(let i=0;i<content.length;i+=43)chunks.push(content.slice(i,i+43));
    if(!chunks.length)chunks.push([]);
    const objects=['<< /Type /Catalog /Pages 2 0 R >>','', '<< /Type /Font /Subtype /Type1 /BaseFont /Courier /Encoding /WinAnsiEncoding >>'];
    const kids=[];
    chunks.forEach((chunk,index)=>{
      const page=objects.length+1,stream=page+1;kids.push(`${page} 0 R`);
      objects.push(`<< /Type /Page /Parent 2 0 R /MediaBox [0 0 612 792] /Resources << /Font << /F1 3 0 R >> >> /Contents ${stream} 0 R >>`);
      const text=['FICTIONAL TRAINING REPORT / TRAINING ADAPTATION',`CyberShield: Case Desk - Page ${index+1} of ${chunks.length}`,'',...chunk];
      const commands=`BT /F1 10 Tf 13 TL 44 748 Td ${text.map((line,i)=>`${i?'T* ':''}(${literal(line)}) Tj`).join('\n')} ET`;
      objects.push(`<< /Length ${commands.length} >>\nstream\n${commands}\nendstream`);
    });
    objects[1]=`<< /Type /Pages /Count ${kids.length} /Kids [${kids.join(' ')}] >>`;
    let body='%PDF-1.4\n',offsets=[0];
    objects.forEach((o,i)=>{offsets.push(body.length);body+=`${i+1} 0 obj\n${o}\nendobj\n`;});
    const xref=body.length;body+=`xref\n0 ${objects.length+1}\n0000000000 65535 f \n`;
    offsets.slice(1).forEach(n=>{body+=`${String(n).padStart(10,'0')} 00000 n \n`;});
    body+=`trailer\n<< /Size ${objects.length+1} /Root 1 0 R >>\nstartxref\n${xref}\n%%EOF\n`;
    return new TextEncoder().encode(body);
  };
  CaseDesk.pdf={bytes,supported,wrap};
})();
