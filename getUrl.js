import { chromium } from "playwright";
import { initializeApp } from "firebase/app";
import { getFirestore } from "firebase/firestore";
import * as Sentry from "@sentry/node";
import { ProfilingIntegration } from "@sentry/profiling-node";
import {
  collection,
  addDoc,
  getDocs,
  query,
  orderBy,
  limit,
} from "firebase/firestore";
const firebaseConfig = {
  apiKey: "AIzaSyDkaKrZGlW9oKVcx5M8xjwtJJlmVdzwxoM",
  authDomain: "altarius-cf1b4.firebaseapp.com",
  projectId: "altarius-cf1b4",
  storageBucket: "altarius-cf1b4.appspot.com",
  messagingSenderId: "768895361924",
  appId: "1:768895361924:web:1eb28a28147cb5779633d1",
};
export default async function getUrl(url, nombreColeccion) {
  transaction.finish();
  const app = initializeApp(firebaseConfig);
  const db = getFirestore(app);
  const coleccion = collection(db, nombreColeccion);
  const lastPost = await getDocs(
    coleccion,
    query(coleccion, orderBy("timestamp", "desc"), limit(1, "timestamp"))
  ).then((e) => e);

  let firstInfo;
  let secondInfo;
  let historyToday;
  const browser = await chromium.launch({
    headless: true,
    slowMo: 2000,
    timeout: 10000,
  });
  const page = await browser.newPage();
  await page.goto(url);
  const table = await page
    .locator(
      "xpath=//html/body/app-root/app-wrapper/div/div[2]/app-derivative/div[5]/div/app-master-data-derivative/div/div[1]/app-widget-derivative-master-data/div/div/div/div/table/tbody/tr"
    )
    .elementHandles();
  let etiInfo = {};

  for (let i = 0; i < table.length; i++) {
    const row = await table[i].$$("td");
    const key = await row[0].innerText();
    const value = await row[1].innerText();
    etiInfo[String(key)] = value;
  }

  let spreadRel;
  let bid = await page
    .locator(
      `xpath=//html/body/app-root/app-wrapper/div/div[2]/app-derivative/div[3]/div[2]/app-widget-quote-box/div/div/table/tbody/tr[3]/td[1]`
    )
    .innerText();
  let isin = await page
    .locator(
      `xpath=//html/body/app-root/app-wrapper/div/div[2]/app-derivative/div[1]/div/app-widget-datasheet-header/div/div/div/div/div[2]/div/span[1]`
    )
    .innerText();

  if (bid !== "-" && bid !== "0.00") {
    bid = await page
      .locator(
        `xpath=//html/body/app-root/app-wrapper/div/div[2]/app-derivative/div[3]/div[2]/app-widget-quote-box/div/div/table/tbody/tr[3]/td[1]`
      )
      .innerText();
    const ask = await page
      .locator(
        `xpath=//html/body/app-root/app-wrapper/div/div[2]/app-derivative/div[3]/div[2]/app-widget-quote-box/div/div/table/tbody/tr[3]/td[2]`
      )
      .innerText();
    const prev = await page
      .locator(
        `xpath=//html/body/app-root/app-wrapper/div/div[2]/app-derivative/div[3]/div[2]/app-widget-quote-box/div/div/table/tbody/tr[5]/td[2]`
      )
      .innerText();
    const spread = await page
      .locator(
        `xpath=//html/body/app-root/app-wrapper/div/div[2]/app-derivative/div[3]/div[2]/app-widget-quote-box/div/div/table/tbody/tr[6]/td[2]`
      )
      .innerText();
    const lastUpdate = await page
      .locator(
        `xpath=//html/body/app-root/app-wrapper/div/div[2]/app-derivative/div[3]/div[2]/app-widget-quote-box/div/div/table/tbody/tr[1]/td[2]`
      )
      .innerText();
    firstInfo = {
      bid,
      ask,
      prev,
      spread,
      lastUpdate,
      isin: isin.split(" ")[1],
    };
    const turnOverEuros = await page
      .locator(
        `xpath=//html/body/app-root/app-wrapper/div/div[2]/app-derivative/div[4]/div[2]/app-price-information/div/div/div/div/table/tbody/tr[1]/td[2]`
      )
      .innerText();
    const turnOverUnits = await page
      .locator(
        `xpath=//html/body/app-root/app-wrapper/div/div[2]/app-derivative/div[4]/div[2]/app-price-information/div/div/div/div/table/tbody/tr[2]/td[2]`
      )
      .innerText();
    const closingPrevDay = await page
      .locator(
        `xpath=//html/body/app-root/app-wrapper/div/div[2]/app-derivative/div[4]/div[2]/app-price-information/div/div/div/div/table/tbody/tr[4]/td[2]`
      )
      .innerText();
    const dayRange = await page
      .locator(
        `xpath=//html/body/app-root/app-wrapper/div/div[2]/app-derivative/div[4]/div[2]/app-price-information/div/div/div/div/table/tbody/tr[5]/td[2]`
      )
      .innerText();
    const week52 = await page
      .locator(
        `xpath=//html/body/app-root/app-wrapper/div/div[2]/app-derivative/div[4]/div[2]/app-price-information/div/div/div/div/table/tbody/tr[6]/td[2]`
      )
      .innerText();
    try {
      spreadRel = await page
        .locator(
          `xpath=//html/body/app-root/app-wrapper/div/div[2]/app-derivative/div[5]/div/app-master-data-derivative/div/div[2]/div[2]/div/app-widget-derivative-key-figures/div/div/div/div/table/tbody/tr/td[2]`
        )
        .innerText();
    } catch (error) {
      console.log(error);
    }

    const clicking = await page
      .locator(
        `xpath=//html/body/app-root/app-wrapper/div/div[2]/app-derivative/app-data-menue/div/div/div/drag-scroll/div/div/button[2]`
      )
      .click();
    const isHistory = await page
      .locator(
        `xpath=//html/body/app-root/app-wrapper/div/div[2]/app-derivative/div[5]/div/app-price-history-derivative/div/div[3]/div/app-widget-history-quotes-derivative/div/div/div[2]/div[3]/app-timepicker/div/timepicker/table/tbody/tr[2]/td[1]/input`
      )
      .isVisible();
    if (isHistory) {
      const firstBid = await page
        .locator(
          `xpath=//html/body/app-root/app-wrapper/div/div[2]/app-derivative/div[5]/div/app-price-history-derivative/div/div[3]/div/app-widget-history-quotes-derivative/div/div/div[4]/div/div/table/tbody/tr[1]/td[2]`
        )
        .innerText();
      const firstAsk = await page
        .locator(
          `xpath=//html/body/app-root/app-wrapper/div/div[2]/app-derivative/div[5]/div/app-price-history-derivative/div/div[3]/div/app-widget-history-quotes-derivative/div/div/div[4]/div/div/table/tbody/tr[1]/td[3]`
        )
        .innerText();
      const highbid = await page
        .locator(
          `xpath=//html/body/app-root/app-wrapper/div/div[2]/app-derivative/div[5]/div/app-price-history-derivative/div/div[3]/div/app-widget-history-quotes-derivative/div/div/div[4]/div/div/table/tbody/tr[2]/td[2]`
        )
        .innerText();
      const highAsk = await page
        .locator(
          `xpath=//html/body/app-root/app-wrapper/div/div[2]/app-derivative/div[5]/div/app-price-history-derivative/div/div[3]/div/app-widget-history-quotes-derivative/div/div/div[4]/div/div/table/tbody/tr[2]/td[3]`
        )
        .innerText();
      const lowbid = await page
        .locator(
          `xpath=//html/body/app-root/app-wrapper/div/div[2]/app-derivative/div[5]/div/app-price-history-derivative/div/div[3]/div/app-widget-history-quotes-derivative/div/div/div[4]/div/div/table/tbody/tr[3]/td[2]`
        )
        .innerText();
      const lowAsk = await page
        .locator(
          `xpath=//html/body/app-root/app-wrapper/div/div[2]/app-derivative/div[5]/div/app-price-history-derivative/div/div[3]/div/app-widget-history-quotes-derivative/div/div/div[4]/div/div/table/tbody/tr[3]/td[3]`
        )
        .innerText();
      const lastbid = await page
        .locator(
          `xpath=//html/body/app-root/app-wrapper/div/div[2]/app-derivative/div[5]/div/app-price-history-derivative/div/div[3]/div/app-widget-history-quotes-derivative/div/div/div[4]/div/div/table/tbody/tr[4]/td[2]`
        )
        .innerText();
      const lastAsk = await page
        .locator(
          `xpath=//html/body/app-root/app-wrapper/div/div[2]/app-derivative/div[5]/div/app-price-history-derivative/div/div[3]/div/app-widget-history-quotes-derivative/div/div/div[4]/div/div/table/tbody/tr[4]/td[3]`
        )
        .innerText();
      historyToday = {
        firstBid,
        firstAsk,
        highbid,
        highAsk,
        lowbid,
        lowAsk,
        lastbid,
        lastAsk,
        fecha: firstInfo.lastUpdate.replace(" ", ":"),
      };
      secondInfo = {
        turnOverEuros,
        turnOverUnits,
        closingPrevDay,
        dayRange,
        week52,
        spreadRel,
      };
    }

    await browser.close();

    const data = {
      etiInfo,
      firstInfo,
      secondInfo,
      historial: [historyToday],
      timestamp: new Date().toISOString(),
    };

    const fecha = lastPost?.docs[0]?.data()?.firstInfo.lastUpdate;
    Sentry.init({
      dsn: "https://75b4714133365bdcafc9665366d3ce0d@o1183910.ingest.sentry.io/4506393301876736",
      integrations: [new ProfilingIntegration()],
      // Performance Monitoring
      tracesSampleRate: 1.0,
      // Set sampling rate for profiling - this is relative to tracesSampleRate
      profilesSampleRate: 1.0,
    });
    if (fecha !== firstInfo.lastUpdate) {
      const res = await addDoc(coleccion, data)
        .then((e) => e)
        .catch((e) => e);
      console.log("Added document with ID: ", res.id, "con datos", data);
      Sentry.captureException(new Error(data));
      process.exit();
    } else {
      console.log("Not Updated because is the same");
      Sentry.captureException(new Error("Not Updated because is the same"));

      process.exit();
    }
  } else {
    console.log("No data, Check if the market is open");
    Sentry.captureException(new Error("No data, Check if the market is open"));
    process.exit();
  }
}
