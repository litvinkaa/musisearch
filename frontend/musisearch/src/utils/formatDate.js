export function format_date(date_input, is_time=true)
{
    date_input = new Date(date_input)
    if((typeof date_input === 'undefined') ||(isNaN(date_input)))
    {
        
        return ''
    }

    let month = date_input.getMonth()+1
    if(month<10)
    {
        month = "0" + month
    }

    let day = date_input.getDate()
    if(day<10)
    {
        day = "0" + day
    }
    if(!is_time)
    {
        let date = date_input.getFullYear()+'-'+month+'-'+day
        return date
    }
    

    let hour = date_input.getHours()
    if(hour<10)
    {
        hour = "0" + hour
    }

    let minute = date_input.getMinutes()
    if(minute<10)
    {
        minute = "0" + minute
    }
    let date = date_input.getFullYear()+'-'+month+'-'+day
    let time = hour + ":" + minute
    let dateTime = date + ', ' + time
    return dateTime
}

