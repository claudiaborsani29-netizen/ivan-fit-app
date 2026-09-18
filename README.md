# Ivan Fit App

MVP installabile come PWA, pronto per GitHub e Vercel.

## Funzioni incluse
- Dashboard allievo
- Allenamento di oggi
- Registrazione kg/reps/check serie
- Timer recupero
- Ultimo carico e suggerimento
- Progressi
- Profilo
- Vista Coach con elenco allievi
- Manifest PWA
- Design nero/oro coerente con il sito Ivan Cecchetti

## Avvio locale
```bash
npm install
npm run dev
```

Apri http://localhost:3000

## Build
```bash
npm run build
```

## Deploy Vercel
1. Crea un nuovo repository GitHub.
2. Carica tutti i file di questa cartella.
3. Importa il repository in Vercel.
4. Framework: Next.js.
5. Deploy.

## Nota MVP
Questa prima versione usa dati demo e localStorage per la registrazione delle serie.
Il passaggio successivo è collegare autenticazione e database reali (utenti, schede,
allenamenti, check, foto e progressi), mantenendo la UI già costruita.
