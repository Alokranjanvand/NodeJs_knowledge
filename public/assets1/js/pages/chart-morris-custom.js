
$(document).ready(function () {
    setTimeout(function () {
        // [ line-angle-chart-Outbound ] Start
        Morris.Line({
            element: 'morris-line-chart',
            data: [{
                y: '2006',
                a: 20,

            },
            {
                y: '2007',
                a: 55,

            },
            {
                y: '2008',
                a: 45,

            },
            {
                y: '2009',
                a: 75,

            }

            ],
            xkey: 'y',
            redraw: true,
            resize: true,
            smooth: true,
            ykeys: ['a'],
            hideHover: 'auto',
            responsive: true,
            labels: ['Series A'],
            lineColors: ['#04a9f5']
        });
        // [ line-angle-chart-Outbound ] end


        // [ line-angle-chart-Inbound ] Start
        Morris.Line({
            element: 'morris-line-chart-in',
            data: [{
                y: '2006',
                a: 20,

            },
            {
                y: '2007',
                a: 55,

            },
            {
                y: '2008',
                a: 45,

            },
            {
                y: '2009',
                a: 75,

            }

            ],
            xkey: 'y',
            redraw: true,
            resize: true,
            smooth: true,
            ykeys: ['a'],
            hideHover: 'auto',
            responsive: true,
            labels: ['Series A'],
            lineColors: ['#34E8DD']
        });
        // [ line-angle-chart-Inbound ] end


        // [ line-angle-chart-Callbacks ] Start
        Morris.Line({
            element: 'morris-line-chart-callback',
            data: [{
                y: '2006',
                a: 20,

            },
            {
                y: '2007',
                a: 55,

            },
            {
                y: '2008',
                a: 45,

            },
            {
                y: '2009',
                a: 75,

            }

            ],
            xkey: 'y',
            redraw: true,
            resize: true,
            smooth: true,
            ykeys: ['a'],
            hideHover: 'auto',
            responsive: true,
            labels: ['Series A'],
            lineColors: ['#FEB47B']
        });
        // [ line-angle-chart-Inbound ] end

        // [ line-angle-chart-Callbacks ] Start
        Morris.Line({
            element: 'morris-line-chart-othercalls',
            data: [{
                y: '2006',
                a: 20,

            },
            {
                y: '2007',
                a: 55,

            },
            {
                y: '2008',
                a: 45,

            },
            {
                y: '2009',
                a: 75,

            }

            ],
            xkey: 'y',
            redraw: true,
            resize: true,
            smooth: true,
            ykeys: ['a'],
            hideHover: 'auto',
            responsive: true,
            labels: ['Series A'],
            lineColors: ['#D96DFF']
        });
        // [ line-angle-chart-Inbound ] end
    }, 700);
});
