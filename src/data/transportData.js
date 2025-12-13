export const busRoutes = [
    {
        id: 1,
        operator: 'Boa Viagem',
        route: '3: Carregado -> Vila Franca de Xira',
        stops: ['Carregado (Centro)', 'Castanheira', 'Vila Franca (Estação)'],
        nextDepartures: ['07:30', '08:15', '09:00', '12:30', '18:00']
    },
    {
        id: 2,
        operator: 'Boa Viagem',
        route: '30: Carregado -> Lisboa (Campo Grande)',
        stops: ['Carregado', 'Alenquer', 'Lisboa'],
        nextDepartures: ['06:45', '07:15', '08:00', '13:00', '17:30']
    },
    {
        id: 3,
        operator: 'Boa Viagem',
        route: '42: Carregado -> Arruda dos Vinhos',
        stops: ['Carregado', 'Cadafais', 'Arruda'],
        nextDepartures: ['08:00', '12:00', '17:15', '19:00']
    }
];

export const trainRoutes = [
    {
        id: 101,
        operator: 'CP Azambuja Line',
        route: 'Carregado -> Lisboa (Oriente/Santa Apolónia)',
        nextDepartures: ['06:58', '07:28', '07:58', '08:28', '09:00'] // Weekday simplified
    },
    {
        id: 102,
        operator: 'CP Regional',
        route: 'Carregado -> Tomar',
        nextDepartures: ['08:15', '10:15', '12:15', '14:15']
    }
];
