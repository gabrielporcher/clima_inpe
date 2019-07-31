const http = require('http')
const xml2js = require('xml2js')
const parser = new xml2js.Parser({attrkey: "ATTR"})
const { Pool, Client } = require('pg')

const client = new Client({
    user: 'postgres',
    host: 'localhost',
    database: 'xml_teste',
    password: '1234',
    port: 5432,
})

let req = http.get("http://servicos.cptec.inpe.br/XML/estacao/SBSM/condicoesAtuais.xml", function(res){
    let data = ''
    res.on('data', function(stream){
        data += stream
    })
    res.on('end', function(){
        parser.parseString(data, function(error, result){
            if(error === null){
                att = result.metar.atualizacao
                pressao = result.metar.pressao
                temp = result.metar.temperatura
                desc = result.metar.tempo_desc
                umidade = result.metar.umidade
                ventodir = result.metar.vento_dir
                ventoint = result.metar.vento_int
                visib = result.metar.visibilidade

                console.log(`Atualização: ${att}, Pressão: ${pressao}, Temperatura: ${temp}, Descricao: ${desc}, Umidade: ${umidade}, Direção do vento: ${ventodir}, Intensidade do vento: ${ventoint}, Visibilidade: ${visib}`)

                client.connect()
                client.query(`INSERT INTO dados (att, pressao, temperatura, descricao, umidade, ventodir, ventoint, visibilidade) VALUES ('${att}', ${pressao}, ${temp}, '${desc}', ${umidade}, ${ventodir}, ${ventoint}, '${visib}')`, (err, res) => {
                    if (err){
                        console.log(err)
                    }
                    else{
                        console.log("Query success")
                        console.log(res)
                    }
                    client.end()
                })
            }
            else{
                console.log(error)
            }
        })
    })
})