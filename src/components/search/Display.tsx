import { IonToggle } from "@ionic/react";
import {useEffect, useMemo, useState} from 'react';
import MessageListItem from "./MessageListItem";
import React from "react";
import {Chart} from 'react-chartjs-2';
import Cookies from 'universal-cookie';
import {constants} from "../../util/constants";
import './Display.css';
import {
    Chart as ChartJS,
    LinearScale,
    CategoryScale,
    BarElement,
    PointElement,
    LineElement,
    Legend,
    Tooltip,
    ArcElement,
    registerables,
    defaults,
    ChartData,
} from 'chart.js';
import {Message} from "../../types/Message";
import MessageThread from "./MessageThread";
import {useParams} from "react-router";
import Loader from "../Loader";

// NOTE: any changes made here must be made in both Chart.jsx & MobileChart.jsx!


ChartJS.register(...registerables);
ChartJS.register(
    ArcElement,
    LinearScale,
    CategoryScale,
    BarElement,
    PointElement,
    LineElement,
    Legend,
    Tooltip
);

defaults.color = '#FFFFFF';
const Display: React.FC<{
    chartDataDailyCount?: any;
    chartDataPerSource?: any;
    chartHeight: number;
    messages: (Message | undefined)[];
    totalCount?: number;
    isLoadingChart?: any;
    isLoadingMessages?: any;
}> = ({
          chartDataDailyCount,
          chartDataPerSource,
          chartHeight,
          messages,
          totalCount,
          isLoadingChart,
          isLoadingMessages
      }) => {

    /**
     * States & Variables
     */
    const cookies = useMemo(() => new Cookies(), []);
    const [showChart, setShowChart] = useState(String(cookies.get('showChart')) === 'false' ? false : true);
    const [selectedMessage, setSelectedMessage] = useState<Message | null>(null);
    const {id: word} = useParams<{ id: string; }>();

    const completelyHideChart = false; // useMemo(() => word.indexOf(" ") !== -1 ? true : false, [word]);

    const definedMessages = messages.filter(Boolean);

    /**
     * Use Effects
     */
    useEffect(() => {
        cookies.set("showChart", String(showChart));
    }, [showChart, cookies])

    /**
     * Functions
     */

    /**
     * Renders
     */
    return (
        <>
            <div className="p-3 overflow-y-scroll rounded-lg">
                <div className="gap-4 mb-4 grid grid-cols-12">

                    {/*search header*/}
                    {definedMessages.length > 0 && (
                        <>
                            <p className={`font-bold ${completelyHideChart ? "col-span-12" : "col-span-6"} sm:text-center`}>
                                Searched on "{decodeURIComponent(word)}" ({totalCount} results last{' '}
                                {constants().numDaysBackGraphs} days)
                            </p>

                            <div className="flex items-center justify-center col-span-6" hidden={completelyHideChart}>
                                <p>Toggle Chart</p>
                                <IonToggle
                                    color="dark"
                                    checked={showChart}
                                    onClick={() => setShowChart(!showChart)}
                                />
                            </div>
                        </>
                    )}

                    {/* bar & line chart */}
                    {isLoadingChart ? <div className="pt-10 flex justify-center items-center"><Loader /></div> : showChart && (Object.keys(chartDataDailyCount).length) &&
                        chartDataDailyCount &&
                        chartDataPerSource &&
                        definedMessages.length > 0 &&
                        !completelyHideChart && (
                            <>
                                <div className="chart">
                                    <Chart
                                        type="bar"
                                        data={chartDataDailyCount}
                                        height={chartHeight}
                                        options={{
                                            plugins: {
                                                legend: {
                                                    display: false,
                                                },
                                                title: {
                                                    display: true,
                                                    text: '# of messages per day (from several Discords)',
                                                },
                                            },
                                            scales: {
                                                y: {
                                                    suggestedMin: 0,
                                                }
                                            },
                                            responsive: true,
                                            maintainAspectRatio: true,
                                        }}
                                        key={chartHeight}
                                    />
                                </div>

                                <div className="chart">
                                    <Chart
                                        type="bar"
                                        data={chartDataPerSource}
                                        height={chartHeight}
                                        options={{
                                            plugins: {
                                                legend: {
                                                    display: false,
                                                },
                                                title: {
                                                    display: true,
                                                    text: '# of messages per Discord',
                                                },
                                            },
                                            responsive: true,
                                            maintainAspectRatio: true,
                                        }}
                                        key={chartHeight}
                                    />
                                </div>
                            </>
                        )}
                </div>

                {/* list of messages, ie. search results */}
                {isLoadingMessages ? <div className="pt-10 flex justify-center items-center"><Loader /></div> : messages?.map((m, i) => (
                    m ? (
                        <MessageListItem
                            onClick={() => {
                                if (m.source === 'Twitter') {
                                    const url = `https://twitter.com/${m.author}`;
                                    window.open(url, '_blank');
                                } else setSelectedMessage(m);
                            }}
                            message={m}
                            key={m.id}
                        />
                    ) : (
                        <MessageListItem index={i} key={i} />
                    )
                ))}

                {/*if you click on a message*/}
                {selectedMessage && (
                    <MessageThread
                        onClose={() => setSelectedMessage(null)}
                        message={selectedMessage}
                    />
                )}
            </div>
        </>
    );
}
export default Display;